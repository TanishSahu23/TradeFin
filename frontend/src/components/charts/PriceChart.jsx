import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
} from "lightweight-charts";

/**
 * Convert a historical-price date into the
 * YYYY-MM-DD format expected by
 * Lightweight Charts for daily candles.
 *
 * IMPORTANT:
 *
 * Do not convert daily market dates into
 * Unix timestamps here.
 *
 * A market date such as:
 *
 * 2026-05-11
 *
 * represents a trading day, not a specific
 * moment in time. Converting it with
 * new Date(...).getTime() can introduce
 * timezone offsets and cause the chart to
 * display the wrong trading day.
 */
const normalizeChartDate = (value) => {
  if (!value) {
    return null;
  }

  /**
   * MongoDB dates may arrive as:
   *
   * "2026-05-11T00:00:00.000Z"
   *
   * or:
   *
   * "2026-05-11"
   *
   * or as a JavaScript Date object.
   *
   * For daily market data, we only care
   * about the calendar date.
   */
  if (typeof value === "string") {
    const match = value.match(
      /^(\d{4}-\d{2}-\d{2})/
    );

    if (match) {
      return match[1];
    }
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }

    return value
      .toISOString()
      .slice(0, 10);
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate
    .toISOString()
    .slice(0, 10);
};

/**
 * Safely convert an OHLC value into a
 * finite number.
 */
const toFiniteNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};

const PriceChart = ({ data = [] }) => {
  const chartContainerRef =
    useRef(null);

  useEffect(() => {
    const container =
      chartContainerRef.current;

    if (!container) {
      return undefined;
    }

    /*
     * -----------------------------------------
     * PREPARE DATA
     * -----------------------------------------
     *
     * Lightweight Charts daily candles should
     * use calendar dates in YYYY-MM-DD format.
     *
     * Example:
     *
     * {
     *   time: "2026-05-11",
     *   open: 1580.21,
     *   high: 1594.9,
     *   low: 1575.24,
     *   close: 1589.9
     * }
     *
     * We deliberately do NOT use:
     *
     * new Date(item.date).getTime()
     *
     * because that converts a calendar trading
     * day into a timezone-dependent timestamp.
     */
    const validData = Array.isArray(data)
      ? data
          .map((item) => {
            const time =
              normalizeChartDate(
                item?.date
              );

            const open =
              toFiniteNumber(
                item?.open
              );

            const high =
              toFiniteNumber(
                item?.high
              );

            const low =
              toFiniteNumber(
                item?.low
              );

            const close =
              toFiniteNumber(
                item?.close
              );

            if (
              !time ||
              open === null ||
              high === null ||
              low === null ||
              close === null
            ) {
              return null;
            }

            return {
              time,
              open,
              high,
              low,
              close,
            };
          })
          .filter(Boolean)
      : [];

    /*
     * -----------------------------------------
     * SORT OLDEST -> NEWEST
     * -----------------------------------------
     */
    validData.sort((a, b) =>
      a.time.localeCompare(b.time)
    );

    /*
     * -----------------------------------------
     * REMOVE DUPLICATE TRADING DAYS
     * -----------------------------------------
     *
     * If multiple records have the same
     * YYYY-MM-DD date, keep the LAST record.
     *
     * This matches the comment and avoids
     * accidentally displaying duplicate candles.
     */
    const uniqueData = [];

    for (const item of validData) {
      const lastItem =
        uniqueData[
          uniqueData.length - 1
        ];

      if (
        lastItem &&
        lastItem.time === item.time
      ) {
        uniqueData[
          uniqueData.length - 1
        ] = item;
      } else {
        uniqueData.push(item);
      }
    }

    /*
     * Useful during development.
     *
     * The important thing to verify is that
     * `time` looks like:
     *
     * "2026-05-11"
     *
     * rather than:
     *
     * 1778524200
     */
    console.log(
      "PriceChart cleaned data:",
      uniqueData
    );

    /*
     * -----------------------------------------
     * CREATE CHART
     * -----------------------------------------
     */
    const chart = createChart(
      container,
      {
        width: container.clientWidth,

        height: 450,

        layout: {
          textColor: "#374151",

          background: {
            color: "#ffffff",
          },
        },

        grid: {
          vertLines: {
            color: "#f3f4f6",
          },

          horzLines: {
            color: "#f3f4f6",
          },
        },

        rightPriceScale: {
          borderColor: "#e5e7eb",
        },

        timeScale: {
          borderColor: "#e5e7eb",

          /**
           * Daily market data is represented
           * by trading dates, so we do not need
           * intraday seconds.
           */
          timeVisible: false,

          secondsVisible: false,

          /**
           * Leave enough room for readable
           * date labels.
           */
          rightOffset: 5,
        },

        crosshair: {
          vertLine: {
            labelBackgroundColor:
              "#374151",
          },

          horzLine: {
            labelBackgroundColor:
              "#374151",
          },
        },
      }
    );

    /*
     * -----------------------------------------
     * CANDLESTICK SERIES
     * -----------------------------------------
     */
    const candlestickSeries =
      chart.addSeries(
        CandlestickSeries,
        {
          upColor: "#16a34a",

          downColor: "#dc2626",

          borderUpColor: "#16a34a",

          borderDownColor: "#dc2626",

          wickUpColor: "#16a34a",

          wickDownColor: "#dc2626",
        }
      );

    /*
     * Lightweight Charts accepts the
     * YYYY-MM-DD strings directly for
     * daily/business-day data.
     */
    candlestickSeries.setData(
      uniqueData
    );

    /*
     * Fit the complete historical dataset
     * into the visible chart area.
     */
    if (uniqueData.length > 0) {
      chart
        .timeScale()
        .fitContent();
    }

    /*
     * -----------------------------------------
     * RESPONSIVE WIDTH
     * -----------------------------------------
     *
     * ResizeObserver is preferable to only
     * listening for window resize because the
     * chart container can also change size
     * when a sidebar, panel, or layout changes.
     */
    const resizeObserver =
      new ResizeObserver(() => {
        if (!container) {
          return;
        }

        const width =
          container.clientWidth;

        if (width > 0) {
          chart.applyOptions({
            width,
          });
        }
      });

    resizeObserver.observe(
      container
    );

    /*
     * -----------------------------------------
     * CLEANUP
     * -----------------------------------------
     */
    return () => {
      resizeObserver.disconnect();

      chart.remove();
    };
  }, [data]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full"
      style={{
        height: "450px",
      }}
    />
  );
};

export default PriceChart;

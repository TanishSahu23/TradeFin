import { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
} from "lightweight-charts";

const PriceChart = ({ data = [] }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }

    if (!data.length) {
      return;
    }

    const chart = createChart(
      chartContainerRef.current,
      {
        width:
          chartContainerRef.current.clientWidth,
        height: 450,

        layout: {
          background: {
            color: "#ffffff",
          },
          textColor: "#1f2937",
        },

        grid: {
          vertLines: {
            color: "#f1f5f9",
          },
          horzLines: {
            color: "#f1f5f9",
          },
        },

        rightPriceScale: {
          borderColor: "#e5e7eb",
        },

        timeScale: {
          borderColor: "#e5e7eb",
          timeVisible: true,
        },
      }
    );

    chartRef.current = chart;

    const candlestickSeries =
      chart.addSeries(CandlestickSeries, {
        upColor: "#16a34a",
        downColor: "#dc2626",
        borderUpColor: "#16a34a",
        borderDownColor: "#dc2626",
        wickUpColor: "#16a34a",
        wickDownColor: "#dc2626",
      });

    const chartData = data
      .map((item) => {
        const date = new Date(item.date);

        if (Number.isNaN(date.getTime())) {
          return null;
        }

        return {
          time: date
            .toISOString()
            .split("T")[0],

          open: Number(item.open),
          high: Number(item.high),
          low: Number(item.low),
          close: Number(item.close),
        };
      })
      .filter((item) => item !== null)
      .filter(
        (item) =>
          Number.isFinite(item.open) &&
          Number.isFinite(item.high) &&
          Number.isFinite(item.low) &&
          Number.isFinite(item.close)
      );

    if (chartData.length > 0) {
      candlestickSeries.setData(chartData);
      chart.timeScale().fitContent();
    }

    const handleResize = () => {
      if (!chartContainerRef.current) {
        return;
      }

      chart.applyOptions({
        width:
          chartContainerRef.current.clientWidth,
      });
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );

      chart.remove();
      chartRef.current = null;
    };
  }, [data]);

  if (!data.length) {
    return (
      <div className="flex h-[450px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500">
        No historical price data available.
      </div>
    );
  }

  return (
    <div
      ref={chartContainerRef}
      className="w-full overflow-hidden rounded-lg"
    />
  );
};

export default PriceChart;
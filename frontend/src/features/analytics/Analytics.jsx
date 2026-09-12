import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getPerformanceAnalytics,
  getRiskAnalytics,
  getDiversificationAnalytics,
  getCorrelationMatrix,
  getBeta,
  getTechnicalAnalysis,
} from "../../api/analytics.api.js";

import { getInstruments } from "../../api/instrument.api.js";

const formatCurrency = (value) => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "—";
  }

  return `₹${Number(value).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  )}`;
};

const formatNumber = (
  value,
  digits = 2
) => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "—";
  }

  return Number(value).toFixed(digits);
};

const formatPercent = (value) => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "—";
  }

  return `${Number(value).toFixed(2)}%`;
};

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const MetricCard = ({
  title,
  value,
  description,
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value}
      </p>

      {description && (
        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
};

const Section = ({
  title,
  description,
  children,
}) => {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
};

const LineChart = ({
  data,
  valueKey,
  label,
  formatter = formatNumber,
}) => {
if (!data || data.length === 0) {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50 text-sm text-gray-500">
      No portfolio history available yet.
    </div>
  );
}

if (data.length === 1) {
  const point = data[0];
  const value = Number(point[valueKey]);

  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-gray-50 text-sm text-gray-500">
      <span>
        {label}
      </span>

      <span className="mt-2 text-xl font-semibold text-gray-900">
        {Number.isFinite(value)
          ? formatter(value)
          : "—"}
      </span>

      <span className="mt-1 text-xs text-gray-500">
        {formatDate(point.date)}
      </span>

      <span className="mt-3 text-xs text-gray-500">
        A second snapshot is required to display performance movement.
      </span>
    </div>
  );
}

  const width = 900;
  const height = 300;

  const paddingLeft = 55;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 45;

  const values = data.map((item) =>
    Number(item[valueKey])
  );

  const validValues = values.filter((value) =>
    Number.isFinite(value)
  );

  if (validValues.length < 2) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50 text-sm text-gray-500">
        No valid data available for this chart.
      </div>
    );
  }

  const minValue = Math.min(
    ...validValues
  );

  const maxValue = Math.max(
    ...validValues
  );

  const range =
    maxValue - minValue || 1;

  const chartWidth =
    width -
    paddingLeft -
    paddingRight;

  const chartHeight =
    height -
    paddingTop -
    paddingBottom;

  const points = data
    .map((item, index) => {
      const value = Number(
        item[valueKey]
      );

      if (!Number.isFinite(value)) {
        return null;
      }

      const x =
        paddingLeft +
        (index /
          Math.max(data.length - 1, 1)) *
          chartWidth;

      const y =
        paddingTop +
        (1 -
          (value - minValue) /
            range) *
          chartHeight;

      return {
        x,
        y,
        value,
        date: item.date,
      };
    })
    .filter(Boolean);

  const path = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  const areaPath = `${path} L ${
    points[points.length - 1].x
  } ${
    height - paddingBottom
  } L ${points[0].x} ${
    height - paddingBottom
  } Z`;

  const firstPoint = points[0];
  const lastPoint =
    points[points.length - 1];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {label}
        </span>

        <span className="text-sm font-semibold text-gray-900">
          {formatter(lastPoint.value)}
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-72 min-w-[700px] w-full"
          preserveAspectRatio="none"
        >
          {[0, 0.25, 0.5, 0.75, 1].map(
            (ratio) => {
              const y =
                paddingTop +
                ratio * chartHeight;

              const value =
                maxValue -
                ratio * range;

              return (
                <g key={ratio}>
                  <line
                    x1={paddingLeft}
                    x2={
                      width -
                      paddingRight
                    }
                    y1={y}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />

                  <text
                    x="5"
                    y={y + 4}
                    fontSize="11"
                    fill="#6b7280"
                  >
                    {formatter(value)}
                  </text>
                </g>
              );
            }
          )}

          <path
            d={areaPath}
            fill="currentColor"
            opacity="0.06"
          />

          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle
            cx={firstPoint.x}
            cy={firstPoint.y}
            r="4"
            fill="currentColor"
          />

          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r="5"
            fill="currentColor"
          />

          <text
            x={paddingLeft}
            y={height - 15}
            fontSize="11"
            fill="#6b7280"
          >
            {formatDate(
              data[0].date
            )}
          </text>

          <text
            x={
              width -
              paddingRight
            }
            y={height - 15}
            textAnchor="end"
            fontSize="11"
            fill="#6b7280"
          >
            {formatDate(
              data[data.length - 1]
                .date
            )}
          </text>
        </svg>
      </div>
    </div>
  );
};

const SectorBar = ({
  sector,
  percentage,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">
          {sector}
        </span>

        <span className="text-gray-500">
          {formatPercent(
            percentage
          )}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gray-900"
          style={{
            width: `${Math.min(
              Math.max(
                Number(percentage) || 0,
                0
              ),
              100
            )}%`,
          }}
        />
      </div>
    </div>
  );
};

const CorrelationMatrix = ({
  matrix,
}) => {
  if (
    !Array.isArray(matrix) ||
    matrix.length === 0
  ) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg bg-gray-50 text-sm text-gray-500">
        Correlation data is not available.
      </div>
    );
  }

  const symbols = matrix.map(
    (row) => row.symbol
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="border border-gray-200 bg-gray-50 px-3 py-3 text-left font-semibold text-gray-600">
              Symbol
            </th>

            {symbols.map((symbol) => (
              <th
                key={symbol}
                className="border border-gray-200 bg-gray-50 px-3 py-3 text-center font-semibold text-gray-600"
              >
                {symbol}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {matrix.map((row) => (
            <tr key={row.symbol}>
              <td className="border border-gray-200 bg-gray-50 px-3 py-3 font-semibold text-gray-700">
                {row.symbol}
              </td>

              {symbols.map(
                (symbol) => {
                  const value =
                    row.values?.[
                      symbol
                    ];

                  const numericValue =
                    Number(value);

                  return (
                    <td
                      key={symbol}
                      className="border border-gray-200 px-3 py-3 text-center font-medium"
                    >
                      {Number.isFinite(
                        numericValue
                      )
                        ? numericValue.toFixed(
                            2
                          )
                        : "—"}
                    </td>
                  );
                }
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Analytics = () => {
  const [performance, setPerformance] =
    useState([]);

  const [risk, setRisk] =
    useState(null);

  const [
    diversification,
    setDiversification,
  ] = useState(null);

  const [
    correlation,
    setCorrelation,
  ] = useState([]);

  const [
    instruments,
    setInstruments,
  ] = useState([]);

  const [
    selectedInstrument,
    setSelectedInstrument,
  ] = useState("");

  const [
    technicals,
    setTechnicals,
  ] = useState(null);

  const [beta, setBeta] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    technicalLoading,
    setTechnicalLoading,
  ] = useState(false);

  const [betaLoading, setBetaLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    technicalError,
    setTechnicalError,
  ] = useState("");

  const [betaError, setBetaError] =
    useState("");

  useEffect(() => {
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        getPerformanceAnalytics(),
        getRiskAnalytics(),
        getDiversificationAnalytics(),
        getCorrelationMatrix(),
        getInstruments(),
      ]);

      const [
        performanceResult,
        riskResult,
        diversificationResult,
        correlationResult,
        instrumentsResult,
      ] = results;

      if (
        performanceResult.status === "fulfilled"
      ) {
        setPerformance(
          Array.isArray(
            performanceResult.value
          )
            ? performanceResult.value
            : []
        );
      } else {
        console.error(
          "Performance analytics failed:",
          performanceResult.reason
        );

        setPerformance([]);
      }

      if (
        riskResult.status === "fulfilled"
      ) {
        setRisk(
          riskResult.value || null
        );
      } else {
        console.error(
          "Risk analytics failed:",
          riskResult.reason
        );

        setRisk(null);
      }

      if (
        diversificationResult.status ===
        "fulfilled"
      ) {
        setDiversification(
          diversificationResult.value ||
            null
        );
      } else {
        console.error(
          "Diversification analytics failed:",
          diversificationResult.reason
        );

        setDiversification(null);
      }

      if (
        correlationResult.status ===
        "fulfilled"
      ) {
        setCorrelation(
          Array.isArray(
            correlationResult.value
          )
            ? correlationResult.value
            : []
        );
      } else {
        console.error(
          "Correlation analytics failed:",
          correlationResult.reason
        );

        setCorrelation([]);
      }

      if (
        instrumentsResult.status ===
        "fulfilled"
      ) {
        const instrumentData =
          Array.isArray(
            instrumentsResult.value
          )
            ? instrumentsResult.value
            : [];

        setInstruments(
          instrumentData
        );

        const firstInstrument =
          instrumentData.find(
            (instrument) =>
              instrument.symbol !==
              "NIFTY50"
          );

        if (firstInstrument) {
          setSelectedInstrument(
            firstInstrument._id
          );
        }
      } else {
        console.error(
          "Instruments request failed:",
          instrumentsResult.reason
        );

        setInstruments([]);
      }
    } catch (err) {
      console.error(
        "Analytics loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  loadAnalytics();
}, []);

  useEffect(() => {
    if (!selectedInstrument) {
      return;
    }

    const loadTechnicals =
      async () => {
        try {
          setTechnicalLoading(
            true
          );

          setTechnicalError("");

          const data =
            await getTechnicalAnalysis(
              selectedInstrument
            );

          setTechnicals(data);
        } catch (err) {
          setTechnicalError(
            err.response?.data
              ?.message ||
              "Failed to load technical analysis."
          );

          setTechnicals(null);
        } finally {
          setTechnicalLoading(
            false
          );
        }
      };

    loadTechnicals();
  }, [selectedInstrument]);

  const benchmark = useMemo(
    () =>
      instruments.find(
        (instrument) =>
          instrument.symbol ===
          "NIFTY50"
      ),
    [instruments]
  );

  useEffect(() => {
    if (
      !selectedInstrument ||
      !benchmark ||
      selectedInstrument ===
        benchmark._id
    ) {
      setBeta(null);
      return;
    }

    const loadBeta = async () => {
      try {
        setBetaLoading(true);
        setBetaError("");

        const data =
          await getBeta(
            selectedInstrument,
            benchmark._id
          );

        setBeta(data);
      } catch (err) {
        setBetaError(
          err.response?.data
            ?.message ||
            "Failed to calculate beta."
        );

        setBeta(null);
      } finally {
        setBetaLoading(false);
      }
    };

    loadBeta();
  }, [
    selectedInstrument,
    benchmark,
  ]);

  const latestPerformance =
    performance.length > 0
      ? performance[
          performance.length - 1
        ]
      : null;

  const sectorAllocation =
    useMemo(() => {
      const holdings =
        diversification
          ?.holdings || [];

      const sectors = {};

      holdings.forEach(
        (holding) => {
          const sector =
            holding.sector ||
            "Other";

          if (!sectors[sector]) {
            sectors[sector] = 0;
          }

          sectors[sector] +=
            Number(
              holding.allocationPercentage
            ) || 0;
        }
      );

      return Object.entries(
        sectors
      )
        .map(
          ([
            sector,
            percentage,
          ]) => ({
            sector,
            percentage,
          })
        )
        .sort(
          (a, b) =>
            b.percentage -
            a.percentage
        );
    }, [diversification]);

  const selectedInstrumentData =
    instruments.find(
      (instrument) =>
        instrument._id ===
        selectedInstrument
    );

  const portfolioValue =
    latestPerformance
      ?.portfolioValue;

  const totalPnL =
    latestPerformance?.totalPnL;

  const cumulativeReturn =
    latestPerformance
      ?.cumulativeReturn;

  const dailyReturn =
    latestPerformance?.dailyReturn;

  const technicalSMA20 =
    technicals?.sma20;

  const technicalSMA50 =
    technicals?.sma50;

  const rsi14 =
    technicals?.rsi14;

  const support =
    technicals?.support;

  const resistance =
    technicals?.resistance;

  const volumeRatio =
    technicals?.volumeRatio;

  const betaValue =
    beta?.beta;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading TradeFin analytics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          Unable to load analytics
        </h2>

        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Analytics
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Portfolio performance, risk,
          diversification and quantitative
          market analysis.
        </p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Portfolio Value"
          value={formatCurrency(
            portfolioValue
          )}
          description="Latest recorded portfolio value"
        />

        <MetricCard
          title="Total P&L"
          value={formatCurrency(
            totalPnL
          )}
          description="Latest recorded P&L"
        />

        <MetricCard
          title="Daily Return"
          value={formatPercent(
            dailyReturn
          )}
          description="Latest daily return"
        />

        <MetricCard
          title="Cumulative Return"
          value={formatPercent(
            cumulativeReturn
          )}
          description="Return since portfolio tracking began"
        />
      </div>

      {/* Performance Charts */}
      <Section
        title="Portfolio Performance"
        description="Historical portfolio value and compounded cumulative return."
      >
        <div className="space-y-8">
          <LineChart
            data={performance}
            valueKey="portfolioValue"
            label="Portfolio Value"
            formatter={formatCurrency}
          />

          <LineChart
            data={performance}
            valueKey="cumulativeReturn"
            label="Cumulative Return"
            formatter={formatPercent}
          />
        </div>
      </Section>

      {/* Daily Returns */}
      <Section
        title="Daily Returns"
        description="Day-by-day portfolio return history."
      >
        <LineChart
          data={performance}
          valueKey="dailyReturn"
          label="Daily Return"
          formatter={formatPercent}
        />
      </Section>

      {/* Risk Analytics */}
      <Section
        title="Risk Analytics"
        description="Risk and risk-adjusted performance measures calculated from portfolio snapshots."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Average Daily Return"
            value={formatPercent(
              risk?.averageDailyReturn
            )}
          />

          <MetricCard
            title="Annualized Return"
            value={formatPercent(
              risk?.annualizedReturn
            )}
          />

          <MetricCard
            title="Volatility"
            value={formatPercent(
              risk?.volatility
            )}
            description="Annualized volatility"
          />

          <MetricCard
            title="Sharpe Ratio"
            value={formatNumber(
              risk?.sharpeRatio,
              4
            )}
            description="Return relative to total volatility"
          />

          <MetricCard
            title="Sortino Ratio"
            value={formatNumber(
              risk?.sortinoRatio,
              4
            )}
            description="Return relative to downside volatility"
          />

          <MetricCard
            title="Maximum Drawdown"
            value={formatPercent(
              risk?.maximumDrawdown
            )}
          />

          <MetricCard
            title="Best Day"
            value={formatPercent(
              risk?.bestDayReturn
            )}
          />

          <MetricCard
            title="Worst Day"
            value={formatPercent(
              risk?.worstDayReturn
            )}
          />
        </div>

        {risk?.message && (
          <p className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
            {risk.message}
          </p>
        )}
      </Section>

      {/* Diversification */}
      <Section
        title="Portfolio Diversification"
        description="Concentration analysis based on current holding weights."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Diversification Score"
            value={formatNumber(
              diversification?.diversificationScore
            )}
            description="Higher indicates greater diversification"
          />

          <MetricCard
            title="HHI"
            value={formatNumber(
              diversification?.hhi,
              4
            )}
            description="Herfindahl-Hirschman concentration index"
          />

          <MetricCard
            title="Concentration"
            value={
              diversification?.concentrationLevel ||
              "—"
            }
          />
        </div>

        <div className="mt-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-800">
            Sector Allocation
          </h3>

          {sectorAllocation.length >
          0 ? (
            <div className="space-y-4">
              {sectorAllocation.map(
                (sector) => (
                  <SectorBar
                    key={
                      sector.sector
                    }
                    sector={
                      sector.sector
                    }
                    percentage={
                      sector.percentage
                    }
                  />
                )
              )}
            </div>
          ) : (
            <div className="rounded-lg bg-gray-50 p-5 text-sm text-gray-500">
              No active holdings available
              for diversification analysis.
            </div>
          )}
        </div>
      </Section>

      {/* Technical Analysis */}
      <Section
        title="Technical Analysis"
        description="Technical indicators calculated from historical OHLCV data."
      >
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Instrument
          </label>

          <select
            value={
              selectedInstrument
            }
            onChange={(event) =>
              setSelectedInstrument(
                event.target.value
              )
            }
            className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500"
          >
            {instruments
              .filter(
                (instrument) =>
                  instrument.symbol !==
                  "NIFTY50"
              )
              .map(
                (instrument) => (
                  <option
                    key={
                      instrument._id
                    }
                    value={
                      instrument._id
                    }
                  >
                    {
                      instrument.symbol
                    }{" "}
                    —{" "}
                    {
                      instrument.name
                    }
                  </option>
                )
              )}
          </select>
        </div>

        {technicalLoading ? (
          <div className="rounded-lg bg-gray-50 p-5 text-sm text-gray-500">
            Calculating technical indicators...
          </div>
        ) : technicalError ? (
          <div className="rounded-lg bg-red-50 p-5 text-sm text-red-600">
            {technicalError}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Latest Price"
              value={formatCurrency(
                technicals?.latestPrice
              )}
            />

            <MetricCard
              title="SMA 20"
              value={formatCurrency(
                technicalSMA20
              )}
              description="20-period simple moving average"
            />

            <MetricCard
              title="SMA 50"
              value={formatCurrency(
                technicalSMA50
              )}
              description="50-period simple moving average"
            />

            <MetricCard
              title="RSI 14"
              value={formatNumber(
                rsi14
              )}
              description="14-period relative strength index"
            />

            <MetricCard
              title="Support"
              value={formatCurrency(
                support
              )}
            />

            <MetricCard
              title="Resistance"
              value={formatCurrency(
                resistance
              )}
            />

            <MetricCard
              title="Latest Volume"
              value={formatNumber(
                technicals?.latestVolume,
                0
              )}
            />

            <MetricCard
              title="Average Volume"
              value={formatNumber(
                technicals?.averageVolume,
                0
              )}
            />

            <MetricCard
              title="Volume Ratio"
              value={formatNumber(
                volumeRatio
              )}
              description="Latest volume / average recent volume"
            />
          </div>
        )}
      </Section>

      {/* Beta */}
      <Section
        title="Beta Analysis"
        description="Historical sensitivity of the selected instrument relative to NIFTY50."
      >
        {selectedInstrumentData ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Instrument"
              value={
                selectedInstrumentData.symbol
              }
            />

            <MetricCard
              title="Benchmark"
              value="NIFTY50"
            />

            <MetricCard
              title="Beta"
              value={
                betaLoading
                  ? "Calculating..."
                  : formatNumber(
                      betaValue,
                      4
                    )
              }
              description={
                beta?.dataPoints
                  ? `${beta.dataPoints} aligned return observations`
                  : "Historical sensitivity measure"
              }
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Select an instrument to calculate beta.
          </p>
        )}

        {betaError && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {betaError}
          </div>
        )}
      </Section>

      {/* Correlation */}
      <Section
        title="Correlation Matrix"
        description="Historical return correlation between active instruments."
      >
        <CorrelationMatrix
          matrix={correlation}
        />
      </Section>

      {/* Research Note */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="font-semibold text-gray-900">
          TradeFin Research Note
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          TradeFin calculates portfolio and market
          analytics from stored paper-trading and
          historical market data. These metrics are
          designed for educational research and
          portfolio analysis and should not be
          interpreted as investment advice.
        </p>
      </div>
    </div>
  );
};

export default Analytics;
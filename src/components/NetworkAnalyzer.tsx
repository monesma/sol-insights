import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { Connection } from "@solana/web3.js";
import Loader from "./Loader";

Chart.register(...registerables);

const NetworkAnalyzer = () => {
  const [blockLatency, setBlockLatency] = useState<number[]>([]);
  const [transactionsPerBlock, setTransactionsPerBlock] = useState<number[]>(
    []
  );
  const [failedTransactionsCount, setFailedTransactionsCount] = useState<
    number[]
  >([]);
  const [tpsHistory, setTpsHistory] = useState<number[]>([]);
  const [timeLabels, setTimeLabels] = useState<string[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number>(5000);
  const [latencyVsTpsVariance, setLatencyVsTpsVariance] = useState<any[]>([]);
  const [tpsVsTxPerBlockVariance, setTpsVsTxPerBlockVariance] = useState<any[]>(
    []
  );
  const [transactionsVsFailedVariance, setTransactionsVsFailedVariance] =
    useState<any[]>([]);

  const connection = new Connection(import.meta.env.VITE_CONNEXION);

  const getBlockPerformanceStats = async () => {
    try {
      const slot = await connection.getSlot();

      const blockTimeStart = await connection.getBlockTime(slot);
      const blockTimeEnd = await connection.getBlockTime(slot + 1);

      if (
        blockTimeStart &&
        blockTimeEnd &&
        typeof blockTimeStart === "number" &&
        typeof blockTimeEnd === "number"
      ) {
        const blockTimeDiff = (blockTimeEnd - blockTimeStart) * 1000; // Convertir en millisecondes

        const blockData = await connection.getBlock(slot, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        });

        if (blockData) {
          const transactionCount = blockData.transactions.length;
          const failedTxCount = await getFailedTransactionsCount(
            blockData.transactions
          );

          setBlockLatency((prev) => [...prev, blockTimeDiff]);
          setTransactionsPerBlock((prev) => [...prev, transactionCount]);
          setFailedTransactionsCount((prev) => [...prev, failedTxCount]);
        }
      } else {
        console.warn(
          "Block time is undefined or not a number",
          blockTimeStart,
          blockTimeEnd
        );
      }
    } catch (error: any) {
      if (error.message.includes("Block not available")) {
        console.warn(
          "Attempt to recover data after an error: Block not available"
        );

        setTimeout(getBlockPerformanceStats, 1000);
      } else {
        console.error("Error fetching block performance stats:", error);
      }
    }
  };

  const getFailedTransactionsCount = async (transactions: any[]) => {
    let failedCount = 0;
    for (const transaction of transactions) {
      if (transaction.meta) {
        try {
          if (transaction.meta.err) {
            failedCount++;
          }
        } catch (error) {
          failedCount++;
        }
      }
    }
    return failedCount;
  };

  const getNetworkCongestionStats = async () => {
    try {
      const blockPerfSamples = await connection.getRecentPerformanceSamples(1);
      const sample = blockPerfSamples[0];

      if (sample) {
        const tps = sample.numTransactions / sample.samplePeriodSecs;
        setTpsHistory((prev) => [...prev, tps]);
      }
    } catch (error) {
      console.error("Error fetching network congestion stats");
    }
  };

  const mean = (data: number[]) => {
    if (!Array.isArray(data)) {
      return 0;
    }

    const filteredData = data.filter((item) => typeof item === "number");

    if (filteredData.length === 0) {
      return 0;
    }

    const sum = filteredData.reduce((acc, value) => acc + value, 0);
    return sum / filteredData.length;
  };

  const calculateVariance = (data1: number[], data2: number[]) => {
    const filteredData1 = data1.filter((item) => typeof item === "number");
    const filteredData2 = data2.filter((item) => typeof item === "number");

    if (filteredData1.length !== filteredData2.length) {
      return 0;
    }

    const differences = filteredData1.map(
      (value, index) => value - filteredData2[index]
    );

    const meanDiff = mean(differences);

    const variance = mean(
      differences.map((diff) => Math.pow(diff - meanDiff, 2))
    );

    return variance;
  };

  const handleChangeInterval = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newInterval = parseInt(event.target.value);
    setRefreshInterval(newInterval);
  };

  useEffect(() => {
    if (
      blockLatency.length > 0 &&
      tpsHistory.length > 0 &&
      blockLatency.length === tpsHistory.length
    ) {
      const newLatencyVsTpsVariance = calculateVariance(
        blockLatency,
        tpsHistory
      );
      setLatencyVsTpsVariance((prev: any) => [
        ...prev,
        newLatencyVsTpsVariance,
      ]);
    }

    if (
      tpsHistory.length > 0 &&
      transactionsPerBlock.length > 0 &&
      tpsHistory.length === transactionsPerBlock.length
    ) {
      const newTpsVsTxPerBlockVariance = calculateVariance(
        tpsHistory,
        transactionsPerBlock
      );
      setTpsVsTxPerBlockVariance((prev: any) => [
        ...prev,
        newTpsVsTxPerBlockVariance,
      ]);
    }

    if (
      transactionsPerBlock.length > 0 &&
      failedTransactionsCount.length > 0 &&
      transactionsPerBlock.length === failedTransactionsCount.length
    ) {
      const newTransactionsVsFailedVariance = calculateVariance(
        transactionsPerBlock,
        failedTransactionsCount
      );
      setTransactionsVsFailedVariance((prev: any) => [
        ...prev,
        newTransactionsVsFailedVariance,
      ]);
    }
  }, [blockLatency, tpsHistory, transactionsPerBlock, failedTransactionsCount]);

  useEffect(() => {
    const fetchData = async () => {
      await getBlockPerformanceStats();
      await getNetworkCongestionStats();

      const currentTime = new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setTimeLabels((prev) => {
        if (!prev.includes(currentTime)) {
          return [...prev, currentTime];
        }
        return prev;
      });
    };

    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  useEffect(() => {
    setBlockLatency([]);
    setTransactionsPerBlock([]);
    setFailedTransactionsCount([]);
    setTpsHistory([]);
    setTimeLabels([]);
    setLatencyVsTpsVariance([]);
    setTpsVsTxPerBlockVariance([]);
    setTransactionsVsFailedVariance([]);
  }, [refreshInterval]);

  const latencyVsTpsData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Latence du bloc (ms)",
        data: blockLatency,
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.1,
      },
      {
        label: "TPS (Transactions par seconde)",
        data: tpsHistory,
        fill: false,
        borderColor: "rgba(153,102,255,1)",
        tension: 0.1,
      },
    ],
  };

  const tpsVsTxPerBlockData = {
    labels: timeLabels,
    datasets: [
      {
        label: "TPS (Transactions par seconde)",
        data: tpsHistory,
        fill: false,
        borderColor: "rgba(153,102,255,1)",
        tension: 0.1,
      },
      {
        label: "Transactions par bloc",
        data: transactionsPerBlock,
        fill: false,
        borderColor: "rgba(54,162,235,1)",
        tension: 0.1,
      },
    ],
  };

  const failedTxVsTxPerBlockData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Transactions par bloc",
        data: transactionsPerBlock,
        fill: false,
        borderColor: "rgba(54,162,235,1)",
        tension: 0.1,
      },
      {
        label: "Transactions échouées",
        data: failedTransactionsCount,
        fill: false,
        borderColor: "rgba(255,99,132,1)",
        tension: 0.1,
      },
    ],
  };

  const latencyVarianceData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Variance (Latency vs TPS)",
        data: latencyVsTpsVariance,
        fill: false,
        borderColor: "rgba(255, 206, 86, 1)",
        borderDash: [10, 5],
        tension: 0.1,
      },
    ],
  };

  const transactionsPerBlockVarianceData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Variance (TPS vs Transactions Per Block)",
        data: tpsVsTxPerBlockVariance,
        fill: false,
        borderColor: "rgba(255, 206, 86, 1)",
        borderDash: [10, 5],
        tension: 0.1,
      },
    ],
  };

  const failedTransactionsVarianceData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Variance (Transactions Per Block vs Failed Transactions)",
        data: transactionsVsFailedVariance,
        fill: false,
        borderColor: "rgba(255, 206, 86, 1)",
        borderDash: [10, 5],
        tension: 0.1,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
          color: "rgba(255, 255, 255, 0.5)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Value",
          color: "rgba(255, 255, 255, 0.5)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
    },
  };

  return (
    <div className="container network">
      <form onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="intervalSelect">Choose refresh interval: </label>
        <select
          id="intervalSelect"
          value={refreshInterval}
          onChange={handleChangeInterval}
        >
          <option value={5000}>5 seconds</option>
          <option value={10000}>10 seconds</option>
          <option value={15000}>15 seconds</option>
          <option value={20000}>20 seconds</option>
          <option value={30000}>30 seconds</option>
          <option value={45000}>45 seconds</option>
          <option value={60000}>1 minute</option>
        </select>
      </form>
      <p>Actual interval: {refreshInterval / 1000} seconds</p>
      <section>
        <h2>1. Block Latency vs Transactions Per Second</h2>
        {blockLatency.length > 0 && tpsHistory.length > 0 ? (
          <>
            <Line data={latencyVsTpsData} options={options} />
            <h4>Latency variance vs TPS</h4>
            {latencyVsTpsVariance.length > 0 ? (
              <Line data={latencyVarianceData} options={options} />
            ) : (
              <Loader />
            )}
          </>
        ) : (
          <Loader />
        )}
        <p>
          Analysing the relationship between block latency and the number of
          transactions per second (TPS) is key to understanding the efficiency
          of the Solana network. High latency means that the time taken to
          confirm a block is extended, which has a direct impact on the number
          of transactions that can be processed within a given timeframe. During
          busy periods, an increase in transactions can lead to congestion,
          increasing confirmation times. Monitoring this relationship helps to
          identify potential bottlenecks in the network and improve the overall
          user experience.
        </p>
        <h3>Variance interpretation:</h3>
        <p>
          A low variance between block latency and the number of transactions
          per second indicates a strong correlation, meaning that when latency
          increases, TPS also tends to decrease. This may indicate a congested
          network, where increased latency has a direct impact on transaction
          processing capacity. On the other hand, a high variance may indicate a
          divergence in timing behaviour, suggesting that fluctuations in block
          latency do not necessarily affect TPS in a consistent way.
        </p>
        <h3>Deductions:</h3>
        <p>
          A sudden change in this variance could signal performance problems,
          such as congestion peaks requiring technical intervention. A
          relatively stable variance, even with fluctuations in latency and TPS
          measurements, could indicate network resilience in the face of
          variable loads.
        </p>
      </section>
      <section>
        <h2>2. Transactions Per Second vs Transactions Per Block</h2>
        {tpsHistory.length > 0 && transactionsPerBlock.length > 0 ? (
          <>
            <Line data={tpsVsTxPerBlockData} options={options} />
            <h4>Variance of TPS vs Transactions Per Block</h4>
            {tpsVsTxPerBlockVariance.length > 0 ? (
              <Line data={transactionsPerBlockVarianceData} options={options} />
            ) : (
              <Loader />
            )}
          </>
        ) : (
          <Loader />
        )}
        <p>
          {" "}
          Analysing the ratio between transactions per second and the number of
          transactions per block helps to assess the network's ability to handle
          the load. If the number of transactions per block increases, this can
          lead to overload and increased latency. Studying these dynamics makes
          it possible to optimise network performance and forecast future needs,
          such as increasing processing capacity, improving infrastructure,
          optimising consensus algorithms or developing scaling solutions to
          manage fluctuations in demand.
        </p>

        <h3>Variance interpretation:</h3>
        <p>
          A low variance between TPS and the number of transactions per block
          indicates a high correlation, meaning that the network is maintaining
          a stable capacity to process transactions. If the variance is high, it
          could mean a divergence in the relationship, where an increase in
          transactions per second does not necessarily lead to a proportional
          increase in transactions per block, or vice versa.
        </p>
        <h3>Deductions:</h3>
        <p>
          Large fluctuations may indicate bottlenecks in transaction processing,
          potentially requiring an increase in processing capacity. The
          stability of this relationship may be a sign of good transaction
          management by the network.
        </p>
      </section>
      <section>
        <h2>3. Transactions Per Block vs Failed Transactions</h2>
        {transactionsPerBlock.length > 0 &&
        failedTransactionsCount.length > 0 ? (
          <>
            <Line data={failedTxVsTxPerBlockData} options={options} />
            <h4>Variance of Transactions Per Block vs Failed Transactions</h4>
            {transactionsVsFailedVariance.length > 0 ? (
              <Line data={failedTransactionsVarianceData} options={options} />
            ) : (
              <Loader />
            )}
          </>
        ) : (
          <Loader />
        )}
        <p>
          {" "}
          Analysing the ratio between the number of transactions per block and
          failed transactions helps to determine the reliability of the network.
          A high number of failed transactions relative to the number of
          transactions per block could indicate congestion or underlying
          problems in transaction processing. Monitoring this relationship helps
          to identify network weaknesses and take corrective action.
        </p>
        <h3>Variance interpretation:</h3>
        <p>
          A low variance between the number of transactions per block and the
          number of failed transactions indicates a strong correlation,
          suggesting that an increase in transactions per block does not
          negatively affect the rate of failed transactions. On the other hand,
          a high variance may suggest a divergence in temporal behaviour, where
          increases in transactions per block do not necessarily translate into
          an increase in failed transactions.
        </p>
        <h3>Deductions:</h3>
        <p>
          An increase in this variance may require further analysis of the
          reasons for transaction failures, whether due to congestion,
          transaction complexity or other factors. Stability in this
          relationship is a good indicator that transactions are being processed
          reliably, even under variable loads..
        </p>
      </section>
    </div>
  );
};

export default NetworkAnalyzer;

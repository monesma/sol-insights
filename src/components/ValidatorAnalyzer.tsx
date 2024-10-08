import { useState, useEffect } from "react";
import { Line, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { Connection } from "@solana/web3.js";
import Loader from "./Loader";
import ScreenSize from "../helpers/ScreenSize";

Chart.register(...registerables);

const ValidatorAnalysis = () => {
  const [validatorVoteLatency, setValidatorVoteLatency] = useState<number[]>(
    []
  );
  const [validatorVoteCount, setValidatorVoteCount] = useState<number[]>([]);
  const [tpsHistory, setTpsHistory] = useState<number[]>([]);
  const [timeLabels, setTimeLabels] = useState<string[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number>(5000); // Interval par défaut: 15 secondes
  const [latencyVsVoteVariance, setLatencyVsVoteVariance] = useState<any[]>([]);
  const [tpsVsVotesVariance, setTpsVsVotesVariance] = useState<any[]>([]);
  const [activeValidators, setActiveValidators] = useState<number[]>([]);
  const [delinquentValidators, setDelinquentValidators] = useState<number[]>([]);
  const [activeVsDelinquentVariance, setActiveVsDelinquentVariance] = useState<number[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const screenW = ScreenSize().width;
  const connection = new Connection(
    import.meta.env.VITE_CONNEXION
  );

  const getValidatorVoteStats = async () => {
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
        const blockTimeDiff = (blockTimeEnd - blockTimeStart) * 1000;

        const voteData = await connection.getVoteAccounts();
        const totalVotes = voteData.current.length + voteData.delinquent.length;

        setValidatorVoteLatency((prev) => [...prev, blockTimeDiff]);
        setValidatorVoteCount((prev) => [...prev, totalVotes]);
      } else {
        console.warn(
          "Block time undefined or not a number",
          blockTimeStart,
          blockTimeEnd
        );
      }
    } catch (error) {
      console.error("Error fetching validator vote stats");
    }
  };


  const analyzeValidators = async () => {
    try {
      const voteAccounts = await connection.getVoteAccounts();
      
      const activeCount = voteAccounts.current.length;
      const delinquentCount = voteAccounts.delinquent.length;

      setActiveValidators(prev => [...prev, activeCount]);
      setDelinquentValidators(prev => [...prev, delinquentCount]);

    } catch (error) {
      console.error("Error fetching validator analysis", error);
    }
  };
  const getNetworkCongestionStats = async () => {
    try {
      const blockPerfSamples = await connection.getRecentPerformanceSamples(1);
      const sample = blockPerfSamples[0];

      if (sample) {
        const tps = sample.numTransactions / sample.samplePeriodSecs; // Calcul TPS
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
      validatorVoteLatency.length > 0 &&
      validatorVoteCount.length > 0 &&
      validatorVoteLatency.length === validatorVoteCount.length
    ) {
      const newLatencyVsVoteVariance = calculateVariance(
        validatorVoteLatency,
        validatorVoteCount
      );
      setLatencyVsVoteVariance((prev: any) => [
        ...prev,
        newLatencyVsVoteVariance,
      ]);
    }

    if (activeValidators.length > 0 && delinquentValidators.length > 0 && activeValidators.length === delinquentValidators.length) {
      const variance = calculateVariance(activeValidators, delinquentValidators);
      setActiveVsDelinquentVariance(prev => [...prev, variance]);
    }

    if (
      tpsHistory.length > 0 &&
      validatorVoteCount.length > 0 &&
      tpsHistory.length === validatorVoteCount.length
    ) {
      const newTpsVsVotesVariance = calculateVariance(
        tpsHistory,
        validatorVoteCount
      );
      setTpsVsVotesVariance((prev: any) => [...prev, newTpsVsVotesVariance]);
    }
  }, [validatorVoteLatency, validatorVoteCount, tpsHistory]);

  useEffect(() => {
    const fetchData = async () => {
      await getValidatorVoteStats();
      await getNetworkCongestionStats();
      await  analyzeValidators()
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
      setLastUpdateTime(currentTime);
    };

    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  useEffect(() => {
    setTpsHistory([]);
    setTimeLabels([]);
    setValidatorVoteCount([]);
    setLatencyVsVoteVariance([]);
    setTpsVsVotesVariance([]);
    setValidatorVoteLatency([]);
    setActiveValidators([]);
    setDelinquentValidators([]);
    setActiveVsDelinquentVariance([]);
  }, [refreshInterval]);

  const latencyVsVotesData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Voting latency (ms)",
        data: validatorVoteLatency,
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.1,
      },
      {
        label: "Validators' votes",
        data: validatorVoteCount,
        fill: false,
        borderColor: "rgba(153,102,255,1)",
        tension: 0.1,
      },
    ],
  };

  const tpsVsVotesData = {
    labels: timeLabels,
    datasets: [
      {
        label: "TPS (Transactions per second)",
        data: tpsHistory,
        fill: false,
        borderColor: "rgba(153,102,255,1)",
        tension: 0.1,
      },
      {
        label: "Validators' votes",
        data: validatorVoteCount,
        fill: false,
        borderColor: "rgba(54,162,235,1)",
        tension: 0.1,
      },
    ],
  };

  const validatorStatusPieData = {
    labels: ["Active Validators", "Delinquent Validators"],
    datasets: [
      {
        data: [
          activeValidators[activeValidators.length - 1] || 0,
          delinquentValidators[delinquentValidators.length - 1] || 0,
        ],
        backgroundColor: ["rgba(75,192,192,1)", "rgba(255,99,132,1)"],
        hoverBackgroundColor: ["rgba(75,192,192,0.7)", "rgba(255,99,132,0.7)"],
      },
    ],
  };

  const latencyVarianceData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Variance (Latency vs Votes)",
        data: latencyVsVoteVariance,
        fill: false,
        borderColor: "rgba(255, 206, 86, 1)",
        borderDash: [10, 5],
        tension: 0.1,
      },
    ],
  };

  
  const tpsVotesVarianceData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Variance (TPS vs Votes)",
        data: tpsVsVotesVariance,
        fill: false,
        borderColor: "rgba(255, 206, 86, 1)",
        borderDash: [10, 5],
        tension: 0.1,
      },
    ],
  };

  const validatorVarianceData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Variance (Active vs Delinquent)",
        data: activeVsDelinquentVariance,
        fill: false,
        borderColor: "rgba(255, 206, 86, 1)",
        borderDash: [10, 5],
        tension: 0.1,
      }
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
        <h2>1. Latency of validator votes vs. number of votes</h2>
        {validatorVoteLatency.length > 0 && validatorVoteCount.length > 0 ? (
          <>
            <Line data={latencyVsVotesData} options={options} />
            <h4>Variance between vote latency and number of votes</h4>
            {latencyVsVoteVariance.length > 0 ? (
              <Line data={latencyVarianceData} options={options} />
            ) : (
              <Loader />
            )}
          </>
        ) : (
          <Loader />
        )}
        <p>
          By analyzing the latency of validator votes in relation to the number
          of votes, we can understand how quickly validators participate in the
          consensus. An increase in vote latency may indicate indicate network
          overload, affecting validators' ability to respond to respond in a
          timely manner. This can potentially slow down the consensus consensus
          process, increasing overall transaction processing transactions.
        </p>
        <h3>Variance interpretation:</h3>
        <p>
          A low variance between vote latency and number of votes indicates a
          strong correlation, meaning that increases in latency can directly
          affect validator participation. A high variance, on the other hand,
          might suggest resilience on the part of validators, even in the face
          of fluctuations in latency.
        </p>
        <h3>Deductions:</h3>
        <p>
          A sudden change in this variance could signal performance problems,
          requiring further investigation into the health of the network. A
          relatively stable variance, even with fluctuations in latency, could
          indicate good resource management on the part of validators.
        </p>
      </section>

      <section>
        <h2>2. TPS vs Number of validator votes</h2>
        {tpsHistory.length > 0 && validatorVoteCount.length > 0 ? (
          <>
            <Line data={tpsVsVotesData} options={options} />
            <h4>Variance between TPS and Number of Votes</h4>
            {tpsVsVotesVariance.length > 0 ? (
              <Line data={tpsVotesVarianceData} options={options} />
            ) : (
              <Loader />
            )}
          </>
        ) : (
          <Loader />
        )}
        <p>
          By analyzing the relationship between transactions per second (TPS)
          and the number of validator votes, we can measure the network's
          ability to maintain a high level of validator participation, even
          during periods of high demand. A high number of TPS can overload the
          network, and it is important to monitor whether or not this affects
          validator participation in consensus.
        </p>
        <h3>Variance interpretation:</h3>
        <p>
          A low variance between TPS and the number of votes shows that
          validators are able to keep pace with transactions even when demand is
          high. A higher variance could indicate that the increase in TPS is
          beginning to affect validators' ability to respond quickly.
        </p>
        <h3>Deductions:</h3>
        <p>
          Large fluctuations in this variance could indicate bottlenecks in
          transaction processing or latency problems for validators. A stable
          relationship, even during periods of high activity, would be a good
          indicator of network resilience.
        </p>
      </section>
      <section>
        <h2>3. Status of Solana Validators</h2>
        {activeValidators.length > 0 && delinquentValidators.length > 0 ? (
          <div id="pie">
            <p>
              <strong>Last update: {lastUpdateTime}</strong>
            </p>
            <div className="camembert">
              <Pie data={validatorStatusPieData} />
              {screenW >= 768 &&<div>
              <p>Here the diagram refreshes automatically at each interval (chosen by you).
                  This gives a better view of the proportional.</p>

                <p>A delinquent validator on Solana is a validator who no longer actively participates in block validation due to technical or network problems, or prolonged inactivity. This can be caused by loss of connection, poor performance or a lack of regular votes.</p>
              </div>}

            </div>
            
            <h4>Variance between active validators and delinquents</h4>
            {activeVsDelinquentVariance.length > 0 ? (
              <Line data={validatorVarianceData} options={options} />
            ) : (
              <Loader />
            )}
          </div>
        ) : (
          <Loader />
        )}
        <p>
        This analysis illustrates the distribution between active and delinquent validators over time. Regular monitoring of this data is essential to assess the health and stability of the network, as a high number of delinquent validators may signal underlying problems in the infrastructure or unfavourable conditions.
        </p>
        <h3>Variance interpretation:</h3>
        <p>
        A low variance between the number of active and delinquent validators indicates network stability. A high variance could indicate potential problems in the network infrastructure or unfavourable conditions affecting certain validators.
        </p>
        <h3>Deductions :</h3>
        <p>
          An increasing number of delinquent validators could indicate wider network problems requiring immediate attention. A stable proportion of active validators suggests a healthy, well-maintained network.
        </p>
      </section>
    </div>
  );
};

export default ValidatorAnalysis;

import NetworkAnalyzer from "../components/NetworkAnalyzer";

const Analysis = () => {
  return (
    <>
      <section className="container otherPage">
        <h1>Solana Network Performance Analysis</h1>
        <p>
          In this analysis, we explore the complex performance dynamics of the
          Solana network through three key axes: block latency versus
          transactions per second (TPS), transactions per second versus
          transactions per block, and failed transactions versus transactions
          per block. By using variance to analyze the variability of different
          metrics, this allows us to shed light on crucial aspects of network
          operation.
        </p>

        <p>
          Variance is a powerful tool that enables us to identify fluctuations,
          analyze anomalies and evaluate overall network performance. More
          specifically, we use it to :
        </p>

        <ul>
          <li>
            <strong>Fluctuations :</strong> By observing how the different
            metrics vary in relation to each other, we can identify periods of
            congestion or moments of stability, which is essential for
            understanding the efficiency of transaction processing.
          </li>
          <li>
            <strong>Anomalies :</strong> Variance values that deviate from the
            norm indicate potential problems that require special attention.
            This approach allows us to detect unexpected behaviour within the
            network.
          </li>
          <li>
            <strong>Performance :</strong> By examining the relationship between
            performance variance, latency and failed transactions, we can draw
            conclusions about network resilience and efficiency, while
            anticipating future capacity requirements.
          </li>
        </ul>

        <p>
          Each of the three analyses provides us with valuable insight into the
          performance of the Solana network, enabling us to identify not only
          bottlenecks, but also optimization opportunities that could improve
          user experience and network reliability.
        </p>
      </section>
      <NetworkAnalyzer />
    </>
  );
};

export default Analysis;

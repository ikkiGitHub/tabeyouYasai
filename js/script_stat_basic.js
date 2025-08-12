document.addEventListener("DOMContentLoaded", async () => {
  // ヘルパー関数：JSONデータをフェッチし、エラー処理も行う
  async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // ヘルパー関数：データの並び替えと抽出を行う
  const getSortedData = (data, key) => {
    // 元のデータを変更しないようにスプレッド構文でコピー
    const sortedData = [...data].sort((a, b) => a[key] - b[key]);
    const items = sortedData.map((item) => item["品目名"]);
    const values = sortedData.map((item) => item[key]);
    return { items, values };
  };

  try {
    const data = await fetchJson("data/json/ky_stat_basic.json");

    // グラフで扱うすべてのデータを事前に計算・準備しておく
    const metrics = [
      "比率-(移動平均7日/近似曲線_値)",
      "比率-(移動平均7日/中央値)",
      "前年同日比(移動平均7日)",
      "前年同日比(移動平均14日)",
      "前年同日比(移動平均30日)",
    ];

    //日付の取得
    date_data = data[0]["日付"];

    const allPlotData = metrics.map((key) => ({
      key,
      ...getSortedData(data, key), // items と values を展開して追加
    }));

    // --- ドロップダウンメニューのオプションを準備 ---
    const dropdownButtons = allPlotData.map((metric, index) => ({
      method: "restyle",
      label: metric.key,
      args: [
        {
          x: [metric.items],
          y: [metric.values],
        },
      ],
    }));

    // --- 初期表示のグラフデータとレイアウトを定義 ---
    // 最初のメトリクス（allPlotData[0]）を初期表示に使う
    const initialMetric = allPlotData[0];
    const plotData = [
      {
        x: initialMetric.items,
        y: initialMetric.values,
        type: "bar",
        marker: {
          color: "rgb(158,202,225)",
          opacity: 0.6,
          line: {
            color: "rgb(8,48,107)",
            width: 1.5,
          },
        },
      },
    ];

    const layout = {
      title: { text: "-割安指標-" + date_data },
      xaxis: { tickangle: -90, automargin: true },
      yaxis: {
        title: {
          text: "パーセント",
        },
      },
      updatemenus: [
        {
          buttons: dropdownButtons,
          direction: "down",
          showactive: true,
          x: 0,
          xanchor: "left",
          y: 1.15,
          yanchor: "top",
        },
      ],
    };

    // グラフを描画
    Plotly.newPlot("myDiv_stat_basic", plotData, layout);
  } catch (error) {
    console.error("データの読み込みに失敗しました:", error);
  }
});

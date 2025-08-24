document.addEventListener("DOMContentLoaded", async () => {
  const filesToLoad = [
    ["data/json/stores_01_stat_time.json", "キャベツ", "#2CA02C"],
    ["data/json/stores_02_stat_time.json", "ねぎ", "#98DF8A"],
    ["data/json/stores_03_stat_time.json", "レタス", "#BCBD22"],
    ["data/json/stores_04_stat_time.json", "ばれいしょ", "#BD7122"],
    ["data/json/stores_05_stat_time.json", "たまねぎ", "#7F7F7F"],
    ["data/json/stores_06_stat_time.json", "きゅうり", "#D62728"],
    ["data/json/stores_07_stat_time.json", "トマト", "#E377C2"],
    ["data/json/stores_08_stat_time.json", "にんじん", "#FF7F0E"],
    ["data/json/stores_09_stat_time.json", "はくさい", "#1fb47bff"],
    ["data/json/stores_10_stat_time.json", "だいこん", "#6b6b6bff"],
    // ["data/json/stores_11_stat_time.json", "なす", "#7627a3ff"],
    // ["data/json/stores_12_stat_time.json", "ほうれんそう", "#cf9415ff"],
    // ["data/json/stores_13_stat_time.json", "ピーマン", "#8C564B"],
  ];

  // Helper function: JSONデータをフェッチして返す
  async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} for ${url}`);
    }
    return response.json();
  }

  // Helper function: データを整形する
  function unpack(rows, key) {
    return rows.map((row) => row[key]);
  }

  // Helper function: トレースオブジェクトを生成する
  function createTrace(data, displayName, lineColor) {
    return {
      type: "scatter",
      mode: "lines",
      name: displayName + "価格",
      x: unpack(data, "調査期間_西暦"),
      y: unpack(data, "価格"),
      line: { color: lineColor },
      visible: "legendonly",
    };
  }

  try {
    // 1. 全てのURLからJSONデータを並行して取得
    const urls = filesToLoad.map((item) => item[0]);
    const results = await Promise.all(urls.map((url) => fetchJson(url)));

    const plotTraces = [];
    let allDates = [];

    // 2. 取得したデータをもとにトレースを生成
    filesToLoad.forEach((fileInfo, index) => {
      const [, displayName, lineColor] = fileInfo;
      const fileData = results[index];

      const dates = unpack(fileData, "調査期間_西暦");
      allDates = allDates.concat(dates);

      plotTraces.push(createTrace(fileData, displayName, lineColor));
    });

    // 3. 初期表示トレースの設定
    plotTraces[3].visible = true;
    plotTraces[4].visible = true;
    plotTraces[7].visible = true;

    // 4. 日付の範囲を計算
    const parsedDates = allDates.map((d) => new Date(d)).sort((a, b) => a - b);
    const latestDate = parsedDates[parsedDates.length - 1];
    const oneYearAgo = new Date(
      latestDate.getFullYear() - 1,
      latestDate.getMonth(),
      latestDate.getDate()
    );

    // 5. レイアウトを定義
    const layout = {
      title: { text: "主要8品目+α 1kg当たりの価格" },
      xaxis: {
        tickformat: "%Y-%m-%d",
        range: [
          oneYearAgo.toISOString().split("T")[0],
          latestDate.toISOString().split("T")[0],
        ],
        rangeselector: {
          buttons: [
            { count: 6, label: "6 month", step: "month", stepmode: "backward" },
            { count: 1, label: "1 year", step: "year", stepmode: "backward" },
            { count: 2, label: "2 year", step: "year", stepmode: "backward" },
            { step: "all", label: "全て" },
          ],
        },
        rangeslider: { autorange: true },
        type: "date",
      },
      yaxis: { autorange: true, type: "linear" },
    };

    // 6. グラフを描画
    Plotly.newPlot("myDiv_store", plotTraces, layout);
  } catch (error) {
    console.error(
      "データの読み込みまたはグラフの描画中にエラーが発生しました:",
      error
    );
  }
});

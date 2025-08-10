document.addEventListener("DOMContentLoaded", async () => {
  const filesToLoad = [
    ["data/json/ky_34400_stat_time.json", "トマト", "#E377C2"],
    ["data/json/ky_36610_stat_time.json", "たまねぎ", "#7F7F7F"],
    ["data/json/ky_34100_stat_time.json", "きゅうり", "#D62728"],
    ["data/json/ky_31900_stat_time.json", "ねぎ", "#98DF8A"],
    ["data/json/ky_31700_stat_time.json", "キャベツ", "#2CA02C"],
    ["data/json/ky_30300_stat_time.json", "にんじん", "#FF7F0E"],
    ["data/json/ky_36200_stat_time.json", "ばれいしょ", "#BD7122"],
    ["data/json/ky_33400_stat_time.json", "レタス", "#BCBD22"],
    ["data/json/ky_33300_stat_time.json", "ブロッコリー", "#1F77B4"],
    ["data/json/ky_34500_stat_time.json", "ピーマン", "#8C564B"],
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
      x: unpack(data, "日付"),
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

      const dates = unpack(fileData, "日付");
      allDates = allDates.concat(dates);

      plotTraces.push(createTrace(fileData, displayName, lineColor));
    });

    // 3. 初期表示トレースの設定
    plotTraces[1].visible = true; // たまねぎ
    plotTraces[5].visible = true; // にんじん
    plotTraces[6].visible = true; // ばれいしょ

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
      title: { text: "主要10品目 1kg当たりの平均価格" },
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
    Plotly.newPlot("myDiv", plotTraces, layout);
  } catch (error) {
    console.error(
      "データの読み込みまたはグラフの描画中にエラーが発生しました:",
      error
    );
  }
});

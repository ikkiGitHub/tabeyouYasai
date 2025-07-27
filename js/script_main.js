document.addEventListener("DOMContentLoaded", () => {
  // 読み込むファイルのパス、表示名、線の色を定義
  const filesToLoad = [
    ["data/json/ky_34400.json", "トマト", "#E377C2"], // ピンク系
    ["data/json/ky_36610.json", "たまねぎ", "#7F7F7F"], // グレー系
    ["data/json/ky_34100.json", "きゅうり", "#D62728"], // 赤系 (アクセントとして)
    ["data/json/ky_31900.json", "ねぎ", "#98DF8A"], // 明るい緑
    ["data/json/ky_31700.json", "キャベツ", "#2CA02C"], // 濃い緑
    ["data/json/ky_30300.json", "にんじん", "#FF7F0E"], // オレンジ系
    ["data/json/ky_36200.json", "ばれいしょ", "#BD7122"], // 薄いオレンジ
    ["data/json/ky_33400.json", "レタス", "#BCBD22"], // 黄緑
    ["data/json/ky_33300.json", "ブロッコリー", "#1F77B4"], // 青系
    ["data/json/ky_34500.json", "ピーマン", "#8C564B"], // 茶色系
  ];

  function loadJsonPromise(url) {
    return new Promise(function (resolve, reject) {
      d3.json(url, function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
  // Promise.all に渡すためのURLの配列を作成
  const urls = filesToLoad.map((item) => item[0]);

  Promise.all(urls.map((url) => loadJsonPromise(url)))
    .then(function (results) {
      function unpack(rows, key) {
        return rows.map(function (row) {
          return row[key];
        });
      }

      const plotTraces = [];
      let allDates = [];

      // filesToLoadの情報を元にループでトレースを生成
      filesToLoad.forEach((fileInfo, index) => {
        const fileName = fileInfo[0];
        const displayName = fileInfo[1];
        const lineColor = fileInfo[2];
        const fileData = results[index];

        const dates = unpack(fileData, "日付");
        allDates = allDates.concat(dates);

        const trace = {
          type: "scatter",
          mode: "lines",
          name: displayName + "価格",
          x: unpack(fileData, "日付"),
          y: unpack(fileData, "価格"),
          line: { color: lineColor },
          visible: "legendonly",
        };
        plotTraces.push(trace);
      });

      // 初期表示
      plotTraces[0].visible = true;
      plotTraces[1].visible = true;
      plotTraces[2].visible = true;
      plotTraces[3].visible = true;
      plotTraces[4].visible = true;

      // 日付の処理
      const parsedDates = allDates
        .map((d) => new Date(d))
        .sort((a, b) => a - b);
      const latestDate = parsedDates[parsedDates.length - 1];
      const oneYearAgo = new Date(latestDate);
      oneYearAgo.setFullYear(latestDate.getFullYear() - 1);
      const startDate = oneYearAgo.toISOString().split("T")[0];
      const endDate = latestDate.toISOString().split("T")[0];

      // レイアウト設定
      var layout = {
        title: { text: "主要10品目" },
        xaxis: {
          tickformat: "%Y-%m-%d",
          range: [startDate, endDate],
          rangeselector: {
            buttons: [
              {
                count: 6,
                label: "6 month",
                step: "month",
                stepmode: "backward",
              },
              {
                count: 1,
                label: "1 year",
                step: "year",
                stepmode: "backward",
              },
              {
                count: 2,
                label: "2 year",
                step: "year",
                stepmode: "backward",
              },
              { step: "all", label: "全て" },
            ],
          },
          rangeslider: { autorange: true },
          type: "date",
        },
        yaxis: {
          autorange: true,
          type: "linear",
        },
      };
      // Plotlyでグラフを描画
      Plotly.newPlot("myDiv", plotTraces, layout);
    })
    .catch(function (error) {
      console.error("ファイル読み込みエラー:", error);
    });
});

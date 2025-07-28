document.addEventListener("DOMContentLoaded", () => {
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

  function unpack(rows, key) {
    return rows.map(function (row) {
      return row[key];
    });
  }

  loadJsonPromise("data/json/ky_items.json")
    .then(async function (vegetableList) {
      const filesToLoad = vegetableList;
      const urls = filesToLoad.map((item) => item.path_stat_time);

      try {
        const allLoadedData = await Promise.all(
          urls.map((url) => loadJsonPromise(url))
        );
        // --- ドロップダウンメニューのオプションを準備 ---
        const dropdownButtons = [];
        filesToLoad.forEach((fileInfo, index) => {
          const displayName = fileInfo.品目コード + " " + fileInfo.品目名;
          const dataForThisItem = allLoadedData[index];
          dropdownButtons.push({
            method: "restyle",
            args: [
              {
                // 各トレースのxデータを配列で渡す
                x: [
                  unpack(dataForThisItem, "日付"), // 価格
                  unpack(dataForThisItem, "日付"), // 近似直線
                  unpack(dataForThisItem, "日付"), // 移動平均 7日
                  unpack(dataForThisItem, "日付"), // 移動平均 14日
                  unpack(dataForThisItem, "日付"), // 移動平均 30日
                ],
                // 各トレースのyデータを配列で渡す
                y: [
                  unpack(dataForThisItem, "価格"), // 価格
                  unpack(dataForThisItem, "reg1"), // 近似直線
                  unpack(dataForThisItem, "ma_7"), // 移動平均 7日
                  unpack(dataForThisItem, "ma_14"), // 移動平均 14日
                  unpack(dataForThisItem, "ma_30"), // 移動平均 30日
                ],
                // 各トレースのnameを配列で渡す
                name: [
                  "価格",
                  "近似曲線",
                  "移動平均 7日",
                  "移動平均 14日",
                  "移動平均 30日",
                ],
                // 各トレースのline.colorを配列で渡す
                "line.color": [
                  "#68f3e7ff", // 価格の線色 (固定)
                  "#000000ff", // 近似直線の線色 (固定)
                  "#868686ff", // MA7の線色 (固定)
                  "#adadadff", // MA14の線色 (固定)
                  "#d6d6d6ff", // MA30の線色 (固定)
                ],
                "line.dash": [
                  "solid", // 価格
                  "dot", // 近似直線
                  "solid", // MA7
                  "solid", // MA14
                  "solid", // MA30
                ],
                "line.width": [
                  2, // 価格
                  4, // 近似直線
                  2, // MA7
                  2, // MA14
                  2, // MA30
                ],
                // 各トレースのvisibleを配列で渡す
                visible: [
                  true, // 価格は常に表示
                  true, // 近似直線は常に表示
                  true, // MA7は常に表示
                  "legendonly", // MA14は非表示
                  "legendonly", // MA30は非表示
                ],
              },
              // 更新するトレースのインデックスすべてを指定 (0から4まで)
              [0, 1, 2, 3, 4],
            ],
            label: displayName,
          });
        });

        // --- 初期表示のデータとトレースを準備 ---
        const initialIndex = 2; // 例: だいこん (インデックス2)を初期表示
        const initialButtonArgs = dropdownButtons[initialIndex].args[0]; // 初期表示ボタンのargsを取得

        const initialTrace = [];
        for (let i = 0; i < initialButtonArgs.x.length; i++) {
          const trace = {
            type: "scatter",
            mode: "lines",
            name: initialButtonArgs.name[i],
            x: initialButtonArgs.x[i],
            y: initialButtonArgs.y[i],
            line: {
              color: initialButtonArgs["line.color"][i],
              dash: initialButtonArgs["line.dash"][i], // dashプロパティを適用
              width: initialButtonArgs["line.width"][i], // widthプロパティを適用
            },
            visible: initialButtonArgs.visible[i],
          };
          initialTrace.push(trace);
        }

        // --- レイアウトとアップデータメニューを定義 ---
        var layout = {
          title: { text: "品物別  1kg当たりの平均価格" },
          xaxis: {
            tickformat: "%Y-%m-%d",
            rangeslider: { visible: true },
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
          },
          yaxis: {
            autorange: true,
            type: "linear",
          },
          updatemenus: [
            {
              active: initialIndex,
              buttons: dropdownButtons,
              direction: "down",
              showactive: true,
              type: "dropdown",
              x: 0,
              xanchor: "left",
              y: 1.5,
              yanchor: "top",
            },
          ],
        };
        // --- 初期グラフの描画 ---
        Plotly.newPlot("myDiv_single", initialTrace, layout);
      } catch (error) {
        console.error("ファイル読み込みエラー:", error);
      }
    })
    .catch(function (error) {
      console.error("ファイル読み込みエラー:", error);
    });
});

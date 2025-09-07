document.addEventListener("DOMContentLoaded", async () => {
  // ヘルパー関数：JSONデータをフェッチし、エラー処理も行う
  async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // ヘルパー関数：オブジェクトの配列から特定のキーの値の配列を抽出
  function unpack(rows, key) {
    return rows.map((row) => row[key]);
  }

  // ヘルパー関数：ドロップダウンボタンのオプションを生成
  function createDropdownButton(fileInfo, dataForThisItem, index) {
    const displayName = `${fileInfo.品目コード} ${fileInfo.品目名}`;
    const xData = [
      unpack(dataForThisItem, "日付"),
      unpack(dataForThisItem, "日付"),
      unpack(dataForThisItem, "日付"),
      unpack(dataForThisItem, "日付"),
      unpack(dataForThisItem, "日付"),
    ];
    const yData = [
      unpack(dataForThisItem, "価格"),
      unpack(dataForThisItem, "reg1"),
      unpack(dataForThisItem, "ma_7"),
      unpack(dataForThisItem, "ma_14"),
      unpack(dataForThisItem, "ma_30"),
    ];
    const names = [
      "価格",
      "近似曲線",
      "移動平均 7日",
      "移動平均 14日",
      "移動平均 30日",
    ];
    const colors = [
      "#68f3e7ff",
      "#000000ff",
      "#868686ff",
      "#adadadff",
      "#d6d6d6ff",
    ];
    const dashes = ["solid", "dot", "solid", "solid", "solid"];
    const widths = [2, 4, 2, 2, 2];
    const visible = [true, true, true, "legendonly", "legendonly"];

    return {
      method: "restyle",
      args: [
        {
          x: xData,
          y: yData,
          name: names,
          "line.color": colors,
          "line.dash": dashes,
          "line.width": widths,
          visible: visible,
        },
        [0, 1, 2, 3, 4],
      ],
      label: displayName,
    };
  }

  // ヘルパー関数：初期トレースを生成
  function createInitialTraces(initialButtonArgs) {
    const initialTrace = [];
    for (let i = 0; i < initialButtonArgs.x.length; i++) {
      initialTrace.push({
        type: "scatter",
        mode: "lines",
        name: initialButtonArgs.name[i],
        x: initialButtonArgs.x[i],
        y: initialButtonArgs.y[i],
        line: {
          color: initialButtonArgs["line.color"][i],
          dash: initialButtonArgs["line.dash"][i],
          width: initialButtonArgs["line.width"][i],
        },
        visible: initialButtonArgs.visible[i],
      });
    }
    return initialTrace;
  }

  // メインの処理
  try {
    // 1. メタデータ（ky_items.json）を読み込む
    const vegetableList = await fetchJson("data/json/ky_items.json");

    // 2. 各アイテムのJSONデータを並行して読み込む
    const urls = vegetableList.map((item) => item.path_stat_time);
    const allLoadedData = await Promise.all(urls.map((url) => fetchJson(url)));

    // 3. ドロップダウンボタンのオプションを生成
    const dropdownButtons = vegetableList.map((fileInfo, index) =>
      createDropdownButton(fileInfo, allLoadedData[index], index)
    );

    // 4. 初期表示のトレースとレイアウトを準備
    const initialIndex = 3; // にんじん
    const initialButtonArgs = dropdownButtons[initialIndex].args[0];
    const initialTrace = createInitialTraces(initialButtonArgs);
    const layout = {
      title: { text: "品物別 1kg当たりの平均価格" },
      xaxis: {
        tickformat: "%Y-%m-%d",
        rangeslider: { visible: true },
        rangeselector: {
          buttons: [
            { count: 6, label: "6 month", step: "month", stepmode: "backward" },
            { count: 1, label: "1 year", step: "year", stepmode: "backward" },
            { count: 2, label: "2 year", step: "year", stepmode: "backward" },
            { step: "all", label: "全て" },
          ],
        },
      },
      yaxis: { autorange: true, type: "linear" },
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

    // 5. グラフを描画
    Plotly.newPlot("myDiv_single", initialTrace, layout);
  } catch (error) {
    console.error("データの読み込みまたはグラフ描画エラー:", error);
  }
});

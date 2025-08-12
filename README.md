# 青果物卸売市場調査（日別調査）

[GitHub Pages](https://ikkigithub.github.io/tabeyouYasai/)

### 使用したデータ：

[出典:「青果物卸売市場調査」(農林水産省)](https://www.maff.go.jp/j/tokei/kouhyou/seika_orosi/index.html#d)

値に関して

- 主要卸売市場計のデータを使用しています

- 使用したデータは、加工して使用しています　正しいデータは農水省の HP からダウンロードしてください
- 詳しい説明も農水省の HP をご覧ください
- 主要 10 品目は、「１世帯当たり年間の品目別支出金額（総世帯）-生鮮野菜　 2023 年度」から支出金額トップ 10 　参照 URL：[e-stat](https://www.e-stat.go.jp/stat-search/files?tclass=000000330013&cycle=7&year=20230)

### 使用した技術など：

python 3.12.11

```Python:python3.12.11
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.service import Service
from selenium.webdriver.support.select import Select
import requests
from bs4 import BeautifulSoup

import os
import re
import datetime
import glob
import shutil
import subprocess

import pdfplumber
import zipfile
import pandas as pd
import matplotlib.dates as mdates
import numpy as np
```

[plotly js](https://github.com/plotly/plotly.js)

---

### 作成意図

安い物(余っている物)を食べる

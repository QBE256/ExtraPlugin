# ExtraPlugin
5chでだけ晒していたやつとか、ニッチそうなのをいろいろまとめる

## カスタムパラメータについて
カスタムパラメータは1つのJSONの中にパラメータをまとめる必要があります。

よって、下記のように記載する必要があります。 

※ 外枠の`{}`については各種スクリプトファイルの例からは省略している場合があるので注意してください
```
{
  <スクリプトAのカスタムパラメータ>,
  <スクリプトBのカスタムパラメータ>,
  <スクリプトCのカスタムパラメータ>,
  ...
  <スクリプトZのカスタムパラメータ>
}
```

例えば、当リポジトリの中にある
`クリティカルが出なくなる武器を設定する機能`と`専用条件を無視して武器を装備できる機能`を

1つの武器に持たせたい場合、それぞれのカスタムパラメータを下記のように設定する必要があります。
```
{
  ignoreConditionWeaponId：10,
  invalidCritical: true
}
```


## 参考URL
https://srpgstudio.com/developer/custom.html

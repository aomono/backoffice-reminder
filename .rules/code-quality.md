# Code Quality Rules

- console.log をプロダクションコードに残さない（デバッグ用はloggerを使う）
- any型の使用禁止（TypeScript strict mode）
- マジックナンバー禁止（定数に切り出す）
- 関数は50行以内、ファイルは300行以内を目安
- 未使用のimport・変数を残さない
- コメントは「なぜ」を書く（「何を」はコードで表現）

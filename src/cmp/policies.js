[{
  name: 'readonly',
  policy: '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["s3:GetBucketLocation","s3:GetObject"],"Resource":["arn:aws:s3:::*"]}]}',
},
{
  name: 'readwrite',
  policy: '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["s3:*"],"Resource":["arn:aws:s3:::*"]}]}',
},
{
  name: 'writeonly',
  policy: '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["s3:PutObject"],"Resource":["arn:aws:s3:::*"]}]}',
},
{
  name: 'consoleAdmin',
  policy: '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["admin:*"]},{"Effect":"Allow","Action":["kms:*"]},{"Effect":"Allow","Action":["s3:*"],"Resource":["arn:aws:s3:::*"]}]}',
},
{
  name: 'diagnostics',
  policy: '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["admin:ServerInfo","admin:ServerTrace","admin:TopLocksInfo","admin:BandwidthMonitor","admin:ConsoleLog","admin:OBDInfo","admin:Profiling","admin:Prometheus"],"Resource":["arn:aws:s3:::*"]}]}',
}]
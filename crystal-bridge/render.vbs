
On Error Resume Next

Dim reportPath, outputPath, orderId
Dim app, report

reportPath = WScript.Arguments(0)
outputPath = WScript.Arguments(1)
orderId = ""

If WScript.Arguments.Count > 2 Then
    orderId = WScript.Arguments(2)
End If

Set app = CreateObject("CrystalRuntime.Application.9")

If Err.Number <> 0 Then
    WScript.Echo "APP_ERROR: " & Err.Description
    WScript.Quit 1
End If

Set report = app.OpenReport(reportPath)

If Err.Number <> 0 Then
    WScript.Echo "REPORT_ERROR: " & Err.Number & " " & Err.Description
    WScript.Quit 1
End If

If orderId <> "" Then
    report.RecordSelectionFormula = "{SalesOrders.OrderId} = '" & Replace(orderId, "'", "''") & "'"

    If Err.Number <> 0 Then
        WScript.Echo "FILTER_ERROR: " & Err.Description
        WScript.Quit 1
    End If
End If

report.ReadRecords

If Err.Number <> 0 Then
    WScript.Echo "READ_ERROR: " & Err.Number & " " & Err.Description
    WScript.Quit 1
End If

report.ExportOptions.DiskFileName = outputPath
report.ExportOptions.DestinationType = 1
report.ExportOptions.FormatType = 31

report.Export False

If Err.Number <> 0 Then
    WScript.Echo "EXPORT_ERROR: " & Err.Number & " " & Err.Description
    WScript.Quit 1
End If

WScript.Echo "EXPORT_OK"

Set report = Nothing
Set app = Nothing

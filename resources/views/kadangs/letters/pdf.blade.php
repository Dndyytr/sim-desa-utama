<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Surat Resmi - {{ $letterNumber }}</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #000;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 15px;
            position: relative;
        }
        .header h3 {
            margin: 0;
            padding: 0;
            text-transform: uppercase;
            font-size: 14pt;
            font-weight: bold;
        }
        .header h2 {
            margin: 0;
            padding: 0;
            text-transform: uppercase;
            font-size: 16pt;
            font-weight: bold;
        }
        .header p {
            margin: 5px 0 0 0;
            font-size: 10pt;
            font-style: italic;
        }
        .line {
            border-top: 3px solid #000;
            border-bottom: 1px solid #000;
            height: 2px;
            margin-top: 8px;
            margin-bottom: 20px;
        }
        .letter-title {
            text-align: center;
            text-transform: uppercase;
            font-weight: bold;
            font-size: 12pt;
            margin-bottom: 2px;
            text-decoration: underline;
        }
        .letter-number {
            text-align: center;
            margin-bottom: 25px;
            font-size: 11pt;
        }
        .content {
            margin-bottom: 30px;
            text-align: justify;
        }
        /* Custom formatting for the rich text */
        .content table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .content table td {
            padding: 4px 8px;
            vertical-align: top;
        }
        .signature-container {
            width: 100%;
            margin-top: 30px;
        }
        .signature {
            float: right;
            text-align: center;
            width: 220px;
        }
        .signature p {
            margin: 0 0 4px 0;
        }
        .clear {
            clear: both;
        }
    </style>
</head>
<body>
    <div class="header">
        <h3>Pemerintah Kabupaten Utama</h3>
        <h3>Kecamatan Desa Utama</h3>
        <h2>Kantor Kepala Desa Utama</h2>
        <p>Jl. Raya Utama No. 1, Desa Utama, Kode Pos 12345</p>
        <div class="line"></div>
    </div>

    <div class="letter-title">
        SURAT KETERANGAN {{ $service->submission->typeService->service_name }}
    </div>
    <div class="letter-number">
        Nomor: {{ $letterNumber }}
    </div>

    <div class="content">
        {!! $content !!}
    </div>

    <div class="signature-container">
        <div class="signature">
            <p>Utama, {{ \Carbon\Carbon::parse($service->updated_at)->translatedFormat('d F Y') }}</p>
            <p>Kepala Desa Utama</p>
            <br><br><br><br>
            <p><strong>Kepala Desa Utama</strong></p>
        </div>
        <div class="clear"></div>
    </div>
</body>
</html>

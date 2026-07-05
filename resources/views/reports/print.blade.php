<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Laporan Pelayanan Desa - {{ $date_printed }}</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #000;
            margin: 10px;
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
            font-size: 12pt;
            font-weight: bold;
        }
        .header h2 {
            margin: 0;
            padding: 0;
            text-transform: uppercase;
            font-size: 14pt;
            font-weight: bold;
        }
        .header p {
            margin: 5px 0 0 0;
            font-size: 9pt;
            font-style: italic;
        }
        .line {
            border-top: 3px solid #000;
            border-bottom: 1px solid #000;
            height: 2px;
            margin-top: 8px;
            margin-bottom: 15px;
        }
        .report-title {
            text-align: center;
            text-transform: uppercase;
            font-weight: bold;
            font-size: 12pt;
            margin-bottom: 15px;
        }
        .meta-table, .metrics-table, .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .meta-table td {
            padding: 3px 5px;
            vertical-align: top;
        }
        .metrics-table th, .metrics-table td, .data-table th, .data-table td {
            border: 1px solid #000;
            padding: 6px;
            text-align: left;
        }
        .metrics-table th, .data-table th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 9pt;
        }
        .metrics-table td {
            text-align: center;
            font-size: 11pt;
            font-weight: bold;
        }
        .data-table td {
            font-size: 9pt;
        }
        .badge {
            padding: 2px 5px;
            font-size: 8pt;
            text-transform: uppercase;
            font-weight: bold;
            border-radius: 3px;
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

    <div class="report-title">
        Laporan Pelayanan Desa
    </div>

    <table class="meta-table">
        <tr>
            <td style="width: 18%;">Periode Laporan</td>
            <td style="width: 2%;">:</td>
            <td style="width: 30%;">
                @if($filters['period'] === 'custom')
                    {{ \Carbon\Carbon::parse($filters['start_date'])->translatedFormat('d F Y') }} s/d {{ \Carbon\Carbon::parse($filters['end_date'])->translatedFormat('d F Y') }}
                @else
                    {{ ucfirst($filters['period']) }}
                @endif
            </td>
            <td style="width: 18%;">Tanggal Cetak</td>
            <td style="width: 2%;">:</td>
            <td style="width: 30%;">{{ $date_printed }}</td>
        </tr>
        <tr>
            <td>Jenis Layanan</td>
            <td>:</td>
            <td>{{ $filters['type_service'] }}</td>
            <td>Dicetak Oleh</td>
            <td>:</td>
            <td>{{ $printed_by->name }}</td>
        </tr>
        <tr>
            <td>Status Layanan</td>
            <td>:</td>
            <td>{{ ucfirst($filters['status']) }}</td>
            <td>Petugas</td>
            <td>:</td>
            <td>{{ $filters['officer'] }}</td>
        </tr>
    </table>

    <h4 style="margin-bottom: 5px; text-transform: uppercase; font-size: 9pt;">Ringkasan Statistik</h4>
    <table class="metrics-table">
        <thead>
            <tr>
                <th>Total Pengajuan</th>
                <th>Selesai</th>
                <th>Sedang Diproses</th>
                <th>Ditolak</th>
                <th>Persentase Selesai</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $metrics['total_submissions'] }}</td>
                <td>{{ $metrics['total_finished'] }}</td>
                <td>{{ $metrics['total_processing'] }}</td>
                <td>{{ $metrics['total_rejected'] }}</td>
                <td>{{ $metrics['completion_rate'] }}%</td>
            </tr>
        </tbody>
    </table>

    <h4 style="margin-bottom: 5px; text-transform: uppercase; font-size: 9pt;">Detail Data Pelayanan</h4>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%; text-align: center;">No</th>
                <th style="width: 20%;">No. Pengajuan / Layanan</th>
                <th style="width: 20%;">Warga Pemohon</th>
                <th style="width: 20%;">Jenis Layanan</th>
                <th style="width: 15%;">Petugas</th>
                <th style="width: 10%; text-align: center;">Status</th>
                <th style="width: 10%; text-align: center;">Tanggal</th>
            </tr>
        </thead>
        <tbody>
            @forelse($reports as $index => $row)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td>
                        <strong>{{ $row->submission_number }}</strong>
                        @if($row->service_number)
                            <br><span style="font-size: 8pt; color: #555;">Layanan: {{ $row->service_number }}</span>
                        @endif
                    </td>
                    <td>
                        {{ $row->resident_name }}
                        <br><span style="font-size: 8pt; color: #555;">NIK: {{ $row->resident_nik }}</span>
                    </td>
                    <td>{{ $row->service_name }}</td>
                    <td>{{ $row->officer_name ?? '-' }}</td>
                    <td style="text-align: center;">
                        @if($row->service_status === 'finished')
                            Selesai
                        @elseif($row->submission_status === 'rejected' || $row->service_status === 'rejected')
                            Ditolak
                        @elseif($row->submission_status === 'pending')
                            Pending
                        @else
                            Diproses
                        @endif
                    </td>
                    <td style="text-align: center;">
                        {{ \Carbon\Carbon::parse($row->submission_created_at)->translatedFormat('d-m-Y') }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" style="text-align: center; font-style: italic; color: #555;">Tidak terdapat data pada periode yang dipilih.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="signature-container">
        <div class="signature">
            <p>Utama, {{ now()->translatedFormat('d F Y') }}</p>
            <p>Kepala Desa Utama</p>
            <br><br><br><br>
            <p><strong>Kepala Desa Utama</strong></p>
        </div>
        <div class="clear"></div>
    </div>
</body>
</html>

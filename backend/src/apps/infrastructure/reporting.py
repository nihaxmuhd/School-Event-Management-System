from collections import OrderedDict
from io import BytesIO, StringIO
import csv

from openpyxl import Workbook


def export_csv(rows, headers):
    buffer = StringIO()
    writer = csv.DictWriter(buffer, fieldnames=headers)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
    return buffer.getvalue().encode('utf-8')


def export_excel(rows, headers, sheet_name='Report'):
    workbook = Workbook()
    worksheet = workbook.active
    worksheet.title = sheet_name[:31]
    worksheet.append(headers)
    for row in rows:
        worksheet.append([row.get(header, '') for header in headers])
    buffer = BytesIO()
    workbook.save(buffer)
    return buffer.getvalue()


def export_pdf(rows, headers, title='Report'):
    lines = [title] + [' | '.join(headers)]
    for row in rows:
        lines.append(' | '.join(str(row.get(header, '')) for header in headers))
    content = '\n'.join(lines)
    pdf = [
        b'%PDF-1.4\n',
        b'1 0 obj<<>>endobj\n',
        b'2 0 obj<< /Type /Catalog /Pages 3 0 R >>endobj\n',
        b'3 0 obj<< /Type /Pages /Kids [4 0 R] /Count 1 >>endobj\n',
        b'4 0 obj<< /Type /Page /Parent 3 0 R /MediaBox [0 0 595 842] /Contents 5 0 R /Resources << /Font << /F1 6 0 R >> >> >>endobj\n',
        f'5 0 obj<< /Length {len(content) + 50} >>stream\nBT /F1 10 Tf 50 800 Td ({content.replace("(", "[").replace(")", "]")}) Tj ET\nendstream endobj\n'.encode('utf-8'),
        b'6 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n',
        b'xref\n0 7\n0000000000 65535 f \ntrailer<< /Root 2 0 R /Size 7 >>\nstartxref\n0\n%%EOF',
    ]
    return b''.join(pdf)


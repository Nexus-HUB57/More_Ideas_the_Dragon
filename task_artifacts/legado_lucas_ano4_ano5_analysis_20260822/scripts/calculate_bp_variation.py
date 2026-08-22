from decimal import Decimal

rows = [
    ('Fundo Principal (FP)', Decimal('964676840.32'), Decimal('1056322640.15')),
    ('Fundo Secundário (FS)', Decimal('257097030.37'), Decimal('281523748.26')),
    ('Fundo Imobiliário Quântico', Decimal('118495964.58'), Decimal('129758581.22')),
    ('Endowment', Decimal('100000000.00'), Decimal('100000000.00')),
    ('Beyour Bank', Decimal('10246960.00'), Decimal('12296352.00')),
    ('Fundo de Participações (FPS)', Decimal('14158664.00'), Decimal('16282463.60')),
    ('Fundo Semente Quântica (FSQ)', Decimal('0.00'), Decimal('6120000.00')),
]

def br(v):
    return f'R$ {v:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.')

for name, a4, a5 in rows:
    delta = a5 - a4
    pct = 'N/A' if a4 == 0 else f'{(delta / a4 * 100):.2f}%'
    print(name, br(a4), br(a5), br(delta), pct)

total4 = Decimal('1464675459.27')
total5 = Decimal('1606303785.23')
print('PATRIMÔNIO TOTAL', br(total4), br(total5), br(total5-total4), f'{(total5-total4)/total4*100:.2f}%')

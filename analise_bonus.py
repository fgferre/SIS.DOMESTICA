salario_liquido_desejado = 3000.00
dependentes = 0

print('='*80)
print('ANALISE MATEMATICA COMPLETA - CALCULO DE BONUS')
print('SIS.DOMESTICA - Janeiro/2025')
print('='*80)
print()

print('CENARIO DE TESTE:')
print(f'  Salario Liquido Desejado: R$ {salario_liquido_desejado:,.2f}')
print(f'  Dependentes: {dependentes}')
print()

faixas_inss = [
    (1518.00, 0.075),
    (2793.88, 0.09),
    (4190.83, 0.12),
    (8157.41, 0.14)
]

desconto_irrf_simplificado = 0.2551

def calcular_inss_progressivo(salario_bruto):
    if salario_bruto <= 0:
        return 0
    inss_total = 0
    faixa_anterior = 0
    for teto, aliquota in faixas_inss:
        faixa_atual = min(teto, salario_bruto) - faixa_anterior
        if faixa_atual > 0:
            inss_faixa = faixa_atual * aliquota
            inss_total += inss_faixa
        faixa_anterior = min(teto, salario_bruto)
    return inss_total

def calcular_irrf(salario_bruto, inss_empregado, dependentes):
    base_irrf = salario_bruto - inss_empregado - (dependentes * 189.59)
    if base_irrf <= 0:
        return 0
    irrf = base_irrf * desconto_irrf_simplificado
    return max(0, irrf)

def calcular_bruto_necessario(liquido_desejado, dependentes, max_iteracoes=100, tolerancia=0.01):
    bruto_estimado = liquido_desejado * 1.4
    for i in range(max_iteracoes):
        inss_emp = calcular_inss_progressivo(bruto_estimado)
        irrf_emp = calcular_irrf(bruto_estimado, inss_emp, dependentes)
        liquido_calculado = bruto_estimado - inss_emp - irrf_emp
        diferenca = liquido_desejado - liquido_calculado
        if abs(diferenca) < tolerancia:
            return bruto_estimado, inss_emp, irrf_emp, liquido_calculado, i+1
        fator_ajuste = liquido_desejado / liquido_calculado if liquido_calculado > 0 else 1.1
        bruto_estimado *= fator_ajuste
    return bruto_estimado, inss_emp, irrf_emp, liquido_calculado, max_iteracoes

print('PASSO 1: CALCULO DO BRUTO NECESSARIO')
print('='*80)
bruto, inss_emp, irrf_emp, liquido_real, iteracoes = calcular_bruto_necessario(salario_liquido_desejado, dependentes)

print(f'Resultado apos {iteracoes} iteracoes:')
print(f'  Salario Bruto Necessario: R$ {bruto:,.2f}')
print(f'  Salario Liquido Obtido: R$ {liquido_real:,.2f}')
print(f'  Diferenca: R$ {abs(salario_liquido_desejado - liquido_real):.2f}')
print()

print('PASSO 2: CALCULO DE TODOS OS COMPONENTES')
print('='*80)
print()

print('2.1 INSS EMPREGADO (Faixas Progressivas):')
print(f'    Salario Bruto: R$ {bruto:,.2f}')
faixa_anterior = 0
for i, (teto, aliquota) in enumerate(faixas_inss, 1):
    faixa_atual = min(teto, bruto) - faixa_anterior
    if faixa_atual > 0:
        inss_faixa = faixa_atual * aliquota
        print(f'    Faixa {i}: R$ {faixa_atual:,.2f} x {aliquota*100:.1f}% = R$ {inss_faixa:,.2f}')
    faixa_anterior = min(teto, bruto)
print(f'    TOTAL INSS Empregado: R$ {inss_emp:,.2f}')
print()

print('2.2 IRRF EMPREGADO:')
base_irrf = bruto - inss_emp - (dependentes * 189.59)
print(f'    Base IRRF = R$ {base_irrf:,.2f}')
print(f'    IRRF = Base x 25.51% = R$ {irrf_emp:,.2f}')
print()

print('2.3 VERIFICACAO DO LIQUIDO:')
liquido_verificado = bruto - inss_emp - irrf_emp
print(f'    Liquido = R$ {bruto:,.2f} - R$ {inss_emp:,.2f} - R$ {irrf_emp:,.2f}')
print(f'    Liquido = R$ {liquido_verificado:,.2f}')
print()

inss_patronal = bruto * 0.08
sat = bruto * 0.008
fgts_deposito = bruto * 0.08
fgts_multa = bruto * 0.032
fgts_total = fgts_deposito + fgts_multa

print(f'2.4 INSS PATRONAL (8%): R$ {inss_patronal:,.2f}')
print(f'2.5 SAT (0.8%): R$ {sat:,.2f}')
print(f'2.6 FGTS DEPOSITO (8%): R$ {fgts_deposito:,.2f}')
print(f'2.7 FGTS MULTA (3.2%): R$ {fgts_multa:,.2f}')
print(f'2.8 FGTS TOTAL (11.2%): R$ {fgts_total:,.2f}')
print()

soma_provisoes_base = bruto/12 + bruto/3/12 + bruto/12
provisoes = soma_provisoes_base * 1.2

print('2.9 PROVISOES:')
print(f'    Formula: (Bruto/12 + Bruto/3/12 + Bruto/12) x 1.2')
print(f'    13o Salario: R$ {bruto/12:,.2f}')
print(f'    Ferias: R$ {bruto/3/12:,.2f}')
print(f'    1/3 Ferias: R$ {bruto/12:,.2f}')
print(f'    Soma Base: R$ {soma_provisoes_base:,.2f}')
print(f'    Provisoes = R$ {soma_provisoes_base:,.2f} x 1.2 = R$ {provisoes:,.2f}')
print(f'    Percentual: 23.33% do bruto')
print()

print('PASSO 3: CALCULO DO BONUS')
print('='*80)
print()

print('REGRA DE BONUS:')
print('  - FGTS Total (11.2%) -> 100% do valor')
print('  - (INSS Pat + SAT + INSS Emp + IRRF Emp + Provisoes) -> 50% do valor')
print()

bonus_fgts = fgts_total
print(f'Componente 1: FGTS Total x 100% = R$ {bonus_fgts:,.2f}')
print()

soma_demais_encargos = inss_patronal + sat + inss_emp + irrf_emp + provisoes
bonus_demais = soma_demais_encargos * 0.5

print(f'Componente 2: (INSS Pat + SAT + INSS Emp + IRRF Emp + Provisoes) x 50%')
print(f'  Soma = R$ {soma_demais_encargos:,.2f}')
print(f'  Bonus = R$ {bonus_demais:,.2f}')
print()

bonus_total = bonus_fgts + bonus_demais
percentual_bonus = (bonus_total / bruto) * 100

print(f'BONUS TOTAL: R$ {bonus_total:,.2f} ({percentual_bonus:.2f}% do bruto)')
print()

print('PASSO 4: RESUMO FINAL E BREAKDOWN')
print('='*80)
print()

total_encargos = inss_patronal + sat + fgts_total + provisoes
custo_total_empregador = bruto + total_encargos - bonus_total

print(f'SALARIO:')
print(f'  Bruto: R$ {bruto:,.2f}')
print(f'  INSS Emp: R$ {inss_emp:,.2f} ({(inss_emp/bruto)*100:.2f}%)')
print(f'  IRRF Emp: R$ {irrf_emp:,.2f} ({(irrf_emp/bruto)*100:.2f}%)')
print(f'  Liquido: R$ {liquido_verificado:,.2f} ({(liquido_verificado/bruto)*100:.2f}%)')
print()

print(f'ENCARGOS PATRONAIS:')
print(f'  INSS Pat: R$ {inss_patronal:,.2f} (8.00%)')
print(f'  SAT: R$ {sat:,.2f} (0.80%)')
print(f'  FGTS Dep: R$ {fgts_deposito:,.2f} (8.00%)')
print(f'  FGTS Multa: R$ {fgts_multa:,.2f} (3.20%)')
print(f'  Provisoes: R$ {provisoes:,.2f} (23.33%)')
print(f'  Total: R$ {total_encargos:,.2f} ({(total_encargos/bruto)*100:.2f}%)')
print()

print(f'BONUS:')
print(f'  FGTS (100%): R$ {bonus_fgts:,.2f}')
print(f'  Demais (50%): R$ {bonus_demais:,.2f}')
print(f'  TOTAL: R$ {bonus_total:,.2f} ({percentual_bonus:.2f}%)')
print()

print(f'CUSTO TOTAL EMPREGADOR:')
print(f'  = Bruto + Encargos - Bonus')
print(f'  = R$ {bruto:,.2f} + R$ {total_encargos:,.2f} - R$ {bonus_total:,.2f}')
print(f'  = R$ {custo_total_empregador:,.2f}')
print()

print('BREAKDOWN DETALHADO DO BONUS')
print('='*80)
print()

print(f'Componente 1 - FGTS Total (100%):')
print(f'  FGTS Deposito: R$ {fgts_deposito:,.2f} -> Bonus: R$ {fgts_deposito:,.2f}')
print(f'  FGTS Multa: R$ {fgts_multa:,.2f} -> Bonus: R$ {fgts_multa:,.2f}')
print(f'  Subtotal: R$ {bonus_fgts:,.2f}')
print()

print(f'Componente 2 - Demais Encargos (50%):')
print(f'  INSS Patronal: R$ {inss_patronal:,.2f} -> Bonus: R$ {inss_patronal * 0.5:,.2f}')
print(f'  SAT: R$ {sat:,.2f} -> Bonus: R$ {sat * 0.5:,.2f}')
print(f'  INSS Empregado: R$ {inss_emp:,.2f} -> Bonus: R$ {inss_emp * 0.5:,.2f}')
print(f'  IRRF Empregado: R$ {irrf_emp:,.2f} -> Bonus: R$ {irrf_emp * 0.5:,.2f}')
print(f'  Provisoes: R$ {provisoes:,.2f} -> Bonus: R$ {provisoes * 0.5:,.2f}')
print(f'  Subtotal: R$ {bonus_demais:,.2f}')
print()

print(f'TOTAL BONUS: R$ {bonus_total:,.2f}')
print()
print('='*80)
print('FIM DA ANALISE')
print('='*80)

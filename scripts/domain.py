"""Conservative accounting primitives. No implicit allocation or imputation."""
from decimal import Decimal
from dataclasses import dataclass
from typing import Optional
STATUSES={'observed','allocated','estimated','missing','suppressed','not_applicable'}
def year(value):
    y=int(str(value)[:4])
    if not 1900<=y<=2100: raise ValueError('Invalid year')
    return y
def department(value): return str(value).zfill(2)[-2:]
def average(previous,current,stable_scope=True):
    if previous is None or current is None or not stable_scope: return None
    return (Decimal(str(previous))*8+Decimal(str(current))*4)/12
def allocate(amount,parts):
    amount=Decimal(str(amount));parts=[Decimal(str(x)) for x in parts]
    if amount<0 or any(x<0 for x in parts) or sum(parts)>amount:raise ValueError('Allocation exceeds source or invalid sign')
    return amount-sum(parts)
@dataclass(frozen=True)
class Observation:
    event: str
    amount: Decimal
    nature: str
    year: int=2025
    population: str='pre_bac'
    evidence: str=''
    transformation: str=''
    status: str='observed'
    unit: str='EUR'
    currency: str='EUR'
    tax: str='TTC'
    included_in: Optional[str]=None
    final: bool=True

def consolidate(rows,basis='payment_net',economic=False):
    allowed={'expense','depreciation'} if economic else {basis}
    chosen=[r for r in rows if r.nature in allowed and r.final and not r.included_in]
    if not chosen:return None
    if len({(r.unit,r.currency,r.tax) for r in chosen})>1:raise ValueError('Incompatible units / HT-TTC')
    if any(r.unit!='EUR' or r.currency!='EUR' or r.tax not in {'HT','TTC'} for r in chosen):raise ValueError('Unqualified unit or tax')
    if any(not r.evidence or not r.transformation for r in chosen):raise ValueError('Missing audit trail')
    if any(r.status not in {'observed','allocated','estimated'} for r in chosen):return None
    if len({(r.event,r.year) for r in chosen})!=len(chosen):raise ValueError('Duplicate event')
    return sum((r.amount for r in chosen),Decimal(0))
def ratio(cost,pupils,cost_population,pupil_population):
    if cost is None or pupils is None or pupils<=0 or cost_population!=pupil_population:return None
    return Decimal(str(cost))/Decimal(str(pupils))
def territorial(panel):
    eligible=[(Decimal(str(c)),Decimal(str(n))) for c,n in panel if c is not None and n is not None and n>0]
    if not eligible:return {'ratio':None,'covered':0,'total':len(panel),'status':'missing'}
    return {'ratio':sum(c for c,n in eligible)/sum(n for c,n in eligible),'covered':len(eligible),'total':len(panel),'status':'partial' if len(eligible)!=len(panel) else 'complete_declared_scope'}
def display_state(value,status):
    if status not in STATUSES: raise ValueError('Unknown quality')
    return {'missing':'Manquant','suppressed':'Masqué','not_applicable':'Sans objet'}.get(status,str(value))
def milestone_label(actual):return 'Réalisé' if actual else 'Prévu'
def condition_label(value):return 'Non documenté' if value is None else str(value)
def independent_entities(rows):return {r['uai'] for r in rows if r['category']=='principal' and not r.get('parent')}

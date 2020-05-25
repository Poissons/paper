import operator
from functools import reduce

import pandas as pd

csv_list = ('../all_data_earlyT.csv',
            '../all_data_midT.csv',
            '../all_data_lateT.csv',
            '../all_data_earlyJ.csv',
            '../all_data_midJ.csv',
            '../all_data_lateJ.csv',
            '../all_data_earlyK.csv',
            '../all_data_lateK.csv')
all_csv = pd.concat((pd.read_csv(csv, index_col=[0]) for csv in csv_list))

NAMES = ('Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species')
SPECIAL_VALUES = [name[0] for name in NAMES]
COL_NAMES = ['is_' + value for value in SPECIAL_VALUES]

for col_name, name, value in zip(COL_NAMES, NAMES, SPECIAL_VALUES):
    all_csv[col_name] = all_csv[name] == value

SORT_BY = [*reduce(operator.add, zip(COL_NAMES, NAMES)),
           'start_year', 'end_year']

all_csv.sort_values(by=SORT_BY, inplace=True, ascending=True)

all_csv.drop(COL_NAMES, axis=1, inplace=True)

all_csv.reset_index(drop=True, inplace=True)

all_csv.to_csv('../data_combined_sorted.csv', encoding='utf-8')

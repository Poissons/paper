import pandas as pd

data_excel_earlyT = pd.read_excel('../data_all_species0515_.xlsx', sheet_name="early T",
                                 usecols=[0, 1, 2, 3, 4, 6, 14, 15, 17, 18, 21, 22])
data_excel_earlyT['年龄早值'] *= -1
data_excel_earlyT['年龄晚值'] *= -1
data_excel_earlyT.rename(columns={'门': 'Phylum', '纲': 'Class', '目': 'Order', '科': 'Family', '属': 'Genus', '种': 'Species',
                                 '经度': 'modern_longitude', '纬度': 'modern_latitude',
                                 '年龄早值': 'start_year', '年龄晚值': 'end_year',
                                 '古经度': 'ancient_longitude', '古纬度': 'ancient_latitude'}, inplace=True)
data_excel_earlyT.to_csv('../all_data_earlyT.csv', encoding='utf-8')

data_excel_midT = pd.read_excel('../data_all_species0515_.xlsx',sheet_name="mid T",
                               usecols=[0, 1, 2, 3, 4, 6, 14, 15, 17, 18, 21, 22])

data_excel_midT['年龄早值'] *= -1
data_excel_midT['年龄晚值'] *= -1
data_excel_midT.rename(columns={'门': 'Phylum', '纲': 'Class', '目': 'Order', '科': 'Family', '属': 'Genus', '种': 'Species',
                                 '经度': 'modern_longitude', '纬度': 'modern_latitude',
                                 '年龄早值': 'start_year', '年龄晚值': 'end_year',
                                 '古经度': 'ancient_longitude', '古纬度': 'ancient_latitude'}, inplace=True)
data_excel_midT.to_csv('../all_data_midT.csv', encoding='utf-8')

data_excel_lateT = pd.read_excel('../data_all_species0515_.xlsx',sheet_name="late T",
                                usecols=[0, 1, 2, 3, 4, 6, 14, 15, 17, 18, 21, 22])
data_excel_lateT['年龄早值'] *= -1
data_excel_lateT['年龄晚值'] *= -1
data_excel_lateT.rename(columns={'门': 'Phylum', '纲': 'Class', '目': 'Order', '科': 'Family', '属': 'Genus', '种': 'Species',
                                 '经度': 'modern_longitude', '纬度': 'modern_latitude',
                                 '年龄早值': 'start_year', '年龄晚值': 'end_year',
                                 '古经度': 'ancient_longitude', '古纬度': 'ancient_latitude'}, inplace=True)
data_excel_lateT.to_csv('../all_data_lateT.csv', encoding='utf-8')


data_excel_earlyJ = pd.read_excel('../data_all_species0515_.xlsx', sheet_name="Early J",
                                 usecols=[0, 1, 2, 3, 4, 6, 14, 15, 17, 18, 21, 22])
data_excel_earlyJ['年龄早值'] *= -1
data_excel_earlyJ['年龄晚值'] *= -1
data_excel_earlyJ.rename(columns={'门': 'Phylum', '纲': 'Class', '目': 'Order', '科': 'Family', '属': 'Genus', '种': 'Species',
                                 '经度': 'modern_longitude', '纬度': 'modern_latitude',
                                 '年龄早值': 'start_year', '年龄晚值': 'end_year',
                                 '古经度': 'ancient_longitude', '古纬度': 'ancient_latitude'}, inplace=True)
data_excel_earlyJ.to_csv('../all_data_earlyJ.csv', encoding='utf-8')

data_excel_midJ = pd.read_excel('../data_all_species0515_.xlsx',sheet_name="Mid J",
                               usecols=[0, 1, 2, 3, 4, 6, 14, 15, 17, 18, 21, 22])
data_excel_midJ['年龄早值'] *= -1
data_excel_midJ['年龄晚值'] *= -1
data_excel_midJ.rename(columns={'门': 'Phylum', '纲': 'Class', '目': 'Order', '科': 'Family', '属': 'Genus', '种': 'Species',
                                 '经度': 'modern_longitude', '纬度': 'modern_latitude',
                                 '年龄早值': 'start_year', '年龄晚值': 'end_year',
                                 '古经度': 'ancient_longitude', '古纬度': 'ancient_latitude'}, inplace=True)
data_excel_midJ.to_csv('../all_data_midJ.csv', encoding='utf-8')

data_excel_lateJ = pd.read_excel('../data_all_species0515_.xlsx',sheet_name="late J",
                                usecols=[0, 1, 2, 3, 4, 6, 14, 15, 17, 18, 21, 22])
data_excel_lateJ['年龄早值'] *= -1
data_excel_lateJ['年龄晚值'] *= -1
data_excel_lateJ.rename(columns={'门': 'Phylum', '纲': 'Class', '目': 'Order', '科': 'Family', '属': 'Genus', '种': 'Species',
                                 '经度': 'modern_longitude', '纬度': 'modern_latitude',
                                 '年龄早值': 'start_year', '年龄晚值': 'end_year',
                                 '古经度': 'ancient_longitude', '古纬度': 'ancient_latitude'}, inplace=True)
data_excel_lateJ.to_csv('../all_data_lateJ.csv', encoding='utf-8')


data_excel_earlyK = pd.read_excel('../data_all_species0515_.xlsx', sheet_name="early K",
                                 usecols=[0, 1, 2, 3, 4, 6, 14, 15, 17, 18, 21, 22])
data_excel_earlyK['年龄早值'] *= -1
data_excel_earlyK['年龄晚值'] *= -1
data_excel_earlyK.rename(columns={'门': 'Phylum', '纲': 'Class', '目': 'Order', '科': 'Family', '属': 'Genus', '种': 'Species',
                                 '经度': 'modern_longitude', '纬度': 'modern_latitude',
                                 '年龄早值': 'start_year', '年龄晚值': 'end_year',
                                 '古经度': 'ancient_longitude', '古纬度': 'ancient_latitude'}, inplace=True)
data_excel_earlyK.to_csv('../all_data_earlyK.csv', encoding='utf-8')


data_excel_lateK = pd.read_excel('../data_all_species0515_.xlsx', sheet_name="late K",
                                usecols=[0, 1, 2, 3, 4, 6, 14, 15, 17, 18, 21, 22])
data_excel_lateK['年龄早值'] *= -1
data_excel_lateK['年龄晚值'] *= -1
data_excel_lateK.rename(columns={'门': 'Phylum', '纲': 'Class', '目': 'Order', '科': 'Family', '属': 'Genus', '种': 'Species',
                                 '经度': 'modern_longitude', '纬度': 'modern_latitude',
                                 '年龄早值': 'start_year', '年龄晚值': 'end_year',
                                 '古经度': 'ancient_longitude', '古纬度': 'ancient_latitude'}, inplace=True)
data_excel_lateK.to_csv('../all_data_lateK.csv', encoding='utf-8')
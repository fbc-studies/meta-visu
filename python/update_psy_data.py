#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from SheetParser import SheetParser
from openpyxl import load_workbook
import json


DATASET = 'psycohorts'
FILENAME = 'PSYCOHORTS-registers.xlsx'
DATA_PATH = '../public/data/' + DATASET + '/'

config = {
    'categories': {"subjects": {"fi": "kohorttilaiset", "en": "subjects"}, "parents": {"fi": "vanhemmat", "en": "parents"}},
    'start_row': 4,
    'reg_adm_col': 'A',
    'reg_col': 'B',
    'harmonize_col': 'C',
    'cat_col': 'D',
    'note_col': 'E',
    'cohort_cols': [
        {
            'col': 'F',
            'cohort': '1966',
            'category': 'subjects'
        },
        {
            'col': 'G',
            'cohort': '1986',
            'category': 'subjects',
        },
        {
            'col': 'H',
            'cohort': '1966',
            'category': 'parents'
        },
        {
            'col': 'I',
            'cohort': '1986',
            'category': 'parents'
        },
        {
            'col': 'J',
            'cohort': '1987',
            'category': 'subjects'
        },
        {
            'col': 'K',
            'cohort': '1997',
            'category': 'subjects'
        },
        {
            'col': 'L',
            'cohort': '1987',
            'category': 'parents',
        },
        {
            'col': 'M',
            'cohort': '1997',
            'category': 'parents',
        },
    ]
}

workbook = load_workbook(FILENAME, read_only=True)
sheet = workbook['registers']
sheet_parser = SheetParser(sheet, config)
sheet_parser.parse_sheet()
data = sheet_parser.data

filenames = []

for dataset in data:
    filename = dataset['name']['en'] + '.json'
    with open(DATA_PATH + filename, 'w', encoding='utf-8') as f:
        print('Create/update file: ' + DATA_PATH + filename)
        json.dump(dataset, f, ensure_ascii=False, default=str, indent=2)
        filenames.append(filename)

with open(DATA_PATH + 'filenames.json', 'w', encoding='utf-8') as f:
    json.dump(filenames, f, ensure_ascii=False, default=str, indent=2)

sheet_parser.bundle_json_files(DATA_PATH)
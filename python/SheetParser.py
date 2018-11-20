#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import regex
import os
import json
from openpyxl.utils import column_index_from_string


def col_index_0_based(col_str):
    return column_index_from_string(col_str) - 1


class SheetParser:
    def __init__(self, sheet, config):
        self.data = []
        self.sheet = sheet
        self.categories = config['categories']
        self.start_row = config['start_row']
        self.reg_adm_col = col_index_0_based(config['reg_adm_col'])
        self.reg_col = col_index_0_based(config['reg_col'])
        self.cat_col = col_index_0_based(config['cat_col'])
        self.harmonize_col = col_index_0_based(config['harmonize_col'])
        self.note_col = col_index_0_based(config['note_col'])
        self.cohort_cols = config['cohort_cols']

    @staticmethod
    def bundle_json_files(path):
        # NOTE: this method breaks if there are subfolders in the given path
        filelist = os.listdir(path)
        try:
            filelist.remove('filenames.json')
            filelist.remove('data_bundle.json')
        except ValueError:
            pass

        data_bundle = {}
        for filename in filelist:
            with open(path + filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
                data_bundle[filename] = data

        with open(path + 'data_bundle.json', 'w', encoding='utf-8') as f:
            json.dump(data_bundle, f, ensure_ascii=False, default=str)

    def add_link(self, link, register_admin_idx, register_idx):
        self.data[register_admin_idx]['registers'][register_idx]['link'] = link

    def create_register_admin(self, register_admin):
        self.data.append({
            'name': register_admin,
            'registers': []
        })

        return len(self.data) - 1

    def create_register(self, register, is_harmonized, register_admin_idx):
        # TODO: add support for keywords
        self.data[register_admin_idx]['registers'].append({
            'name': register,
            'isHarmonized': is_harmonized,
            'link': {'fi': "", 'en': ""},
            'categories': []
        })
        return len(self.data[register_admin_idx]['registers']) - 1

    def create_category(self, category, note, register_admin_idx, register_idx):
        self.data[register_admin_idx]['registers'][register_idx]['categories'].append({
            'name': category,
            'note': note,
            'samplings': []
        })
        return len(self.data[register_admin_idx]['registers'][register_idx]['categories']) - 1

    def create_samplings(self, dates_str, cohort, category):
        dates = self.parse_dates(dates_str)
        samplings = []
        for date in dates:
            samplings.append({
                'startDate': date['start_date'],
                'endDate': date['end_date'],
                'cohort': cohort,
                'category': self.categories[category]
            })
        return samplings

    def add_samplings(self, samplings, register_admin_idx, register_idx, category_idx):
        for sampling in samplings:
            self.data[register_admin_idx]['registers'][register_idx]['categories'][category_idx]['samplings'].append(
                sampling)

    def find_by_name(self, list, name, lang):
        for idx, item in enumerate(list):
            if item['name'][lang] == name[lang]:
                return idx
        else:
            return None

    def format_date(self, date_str, default_date):
        valid1 = regex.match(r'^[0-9]{4}$', date_str)
        valid2 = regex.match(r'^[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{4}$', date_str)

        if valid1:
            return date_str + default_date
        elif valid2:
            date_components = date_str.split('.')
            day = date_components[0].zfill(2)
            month = date_components[1].zfill(2)
            year = date_components[2]
            return year + '-' + month + '-' + day
        else:
            return False

    def parse_dates(self, raw_dates_str):
        dates = []
        raw_dates_str = raw_dates_str.replace(' ', '')
        dates_list = raw_dates_str.split(';')
        for date_str in dates_list:
            start_date = self.format_date(date_str.split('-')[0], '-01-01')
            if start_date:
                end_date = self.format_date(date_str.split(
                    '-')[1], '-12-31') if len(date_str.split('-')) > 1 else start_date

                dates.append({'start_date': start_date, 'end_date': end_date})
        return dates

    def parse_sheet(self):
        register_admin = {'en': '', 'fi': ''}
        register = {'en': '', 'fi': ''}
        category = {'en': '', 'fi': ''}
        category_note = {'en': '', 'fi': ''}

        iterator = self.sheet.iter_rows(min_row=self.start_row)
        for row in iterator:
            row_fi = row
            try:
                row_en = next(iterator)
            except StopIteration:
                break

            if len(row_en) == 0:
                break

            register_admin['fi'] = row_fi[self.reg_adm_col].value if row_fi[self.reg_adm_col].value != None else register_admin['fi']
            register_admin['en'] = row_en[self.reg_adm_col].value if row_en[self.reg_adm_col].value != None else register_admin['en']
            register_admin_idx = self.find_by_name(self.data, register_admin, 'en')

            if register_admin_idx == None:
                # using dict() here creates a copy of the dict so the function doesn't modify the original
                register_admin_idx = self.create_register_admin(dict(register_admin))

            register['fi'] = row_fi[self.reg_col].value if row_fi[self.reg_col].value != None else register['fi']
            register['en'] = row_en[self.reg_col].value if row_en[self.reg_col].value != None else register['en']
            register_idx = self.find_by_name(
                self.data[register_admin_idx]['registers'], register, 'en')

            if register_idx == None:
                is_harmonized = row_fi[self.harmonize_col].value == True
                # using dict() here creates a copy of the dict so the function doesn't modify the original
                register_idx = self.create_register(dict(register), is_harmonized, register_admin_idx)

            category['fi'] = row_fi[self.cat_col].value if row_fi[self.cat_col].value != None else category['fi']
            category['en'] = row_en[self.cat_col].value if row_en[self.cat_col].value != None else category['en']
            category_idx = self.find_by_name(self.data[register_admin_idx]['registers']
                                             [register_idx]['categories'], category, 'en')

            if category_idx == None:
                category_note['fi'] = row_fi[self.note_col].value if row_fi[self.note_col].value != None else ''
                category_note['en'] = row_en[self.note_col].value if row_en[self.note_col].value != None else ''
                # using dict() here creates a copy of the dict so the function doesn't modify the original
                category_idx = self.create_category(
                    dict(category), dict(category_note), register_admin_idx, register_idx)

            samplings = []
            for cohort_col in self.cohort_cols:
                col = col_index_0_based(cohort_col['col'])
                cohort_dates_str = str(row_fi[col].value)
                cohort_samplings = self.create_samplings(
                    cohort_dates_str, cohort_col['cohort'], cohort_col['category'])
                samplings += cohort_samplings

            self.add_samplings(samplings, register_admin_idx, register_idx, category_idx)

    def parse_link_sheet(self, link_sheet):
        register_admin = {'fi': '', 'en': ''}

        link_col = 2
        iterator = link_sheet.iter_rows(min_row=self.start_row)
        for row in iterator:
            row_fi = row
            try:
                row_en = next(iterator)
            except StopIteration:
                break

            if len(row_en) == 0:
                break

            # NOTE: this method assumes that register admins and registers have already been created
            # with parse_sheet()
            register_admin['fi'] = row_fi[self.reg_adm_col].value if row_fi[self.reg_adm_col].value != None else register_admin['fi']
            register_admin['en'] = row_en[self.reg_adm_col].value if row_en[self.reg_adm_col].value != None else register_admin['en']
            register_admin_idx = self.find_by_name(self.data, register_admin, 'en')

            register = {'fi': row_fi[self.reg_col].value, 'en': row_en[self.reg_col].value}
            register_idx = self.find_by_name(self.data[register_admin_idx]['registers'], register, 'en')

            try:
                link_fi = row_fi[link_col].value if row_fi[link_col].value != None else ''
            except IndexError:
                link_fi = ''

            try:
                link_en = row_en[link_col].value if row_en[link_col].value != None else ''
            except IndexError:
                link_en = ''

            link = {'fi': link_fi, 'en': link_en}
            self.add_link(dict(link), register_admin_idx, register_idx)

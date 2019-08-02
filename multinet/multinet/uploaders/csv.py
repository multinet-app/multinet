"""Multinet uploader for CSV files."""
import csv
from io import StringIO
import re

from .. import db

from flask import Blueprint, request
from flask import current_app as app

bp = Blueprint('csv', __name__)


def validate_csv(rows):
    """Perform any necessary CSV validation, and raise appropriate exceptions."""
    if '_key' in rows.fieldnames:
        # Node Table, check for key uniqueness
        keys = [row['_key'] for row in rows]
        uniqueKeys = set()
        duplicates = set()
        for key in keys:
            if key in uniqueKeys:
                duplicates.add(key)
            else:
                uniqueKeys.add(key)

        if (len(duplicates) > 0):
            return {'error': 'duplicate',
                    'detail': list(duplicates)}
    elif '_from' in rows.fieldnames and '_to' in rows.fieldnames:
        # Edge Table, check that each cell has the correct format
        valid_cell = re.compile('[^/]+/[^/]+')

        detail = []

        for i, row in enumerate(rows):
            fields = []
            if not valid_cell.match(row['_from']):
                fields.append('_from')
            if not valid_cell.match(row['_to']):
                fields.append('_to')

            if fields:
                # i+2 -> +1 for index offset, +1 due to header row
                detail.append({'fields': fields,
                               'row': i + 2})

        if detail:
            return {'error': 'syntax',
                    'detail': detail}

    return None


@bp.route('/<workspace>/<table>', methods=['POST'])
def upload(workspace, table):
    """
    Store a CSV file into the database as a node or edge table.

    `workspace` - the target workspace
    `table` - the target table
    `data` - the CSV data, passed in the request body. If the CSV data contains
             `_from` and `_to` fields, it will be treated as an edge table.
    """
    app.logger.info('Bulk Loading')

    body = request.data.decode('utf8')

    rows = csv.DictReader(StringIO(body))
    workspace = db.db(workspace)

    # Do any CSV validation necessary, and raise appropriate exceptions
    result = validate_csv(rows)
    if result:
        return (result, '400 CSV Validation Failed')

    # Set the collection, paying attention to whether the data contains
    # _from/_to fields.
    # coll = None
    if workspace.has_collection(table):
        coll = workspace.collection(table)
    else:
        edges = '_from' in rows.fieldnames and '_to' in rows.fieldnames
        coll = workspace.create_collection(table, edge=edges)

    # Insert the data into the collection.
    results = coll.insert_many(rows)
    return dict(count=len(results))

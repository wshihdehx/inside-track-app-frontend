import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { group } from '@angular/animations';
import { FormArray, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { TableDataService } from './table-data.service';

export class Group {
  level = 0;
  parent: Group;
  expanded = true;
  totalCounts = 0;
  get visible(): boolean {
    return !this.parent || (this.parent.visible && this.parent.expanded);
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'inside-track-webapp';

  public dataSource = new MatTableDataSource<any | Group>([]);

  _alldata: any[] = [];
  columns: any[] = [];
  displayedColumns: string[] = [];
  groupByColumns: string[] = [];

  result: any[] = [];

  fileEvent(fileInput){
    let file = fileInput.target.files[0];
    let fileName = file.name;

    this.dataSourceService.uploadFile(fileName)
    .subscribe(
      (data: any) => {
          console.log(data);
        },
      (err: any) => console.log(err)
    );
  }

  constructor(protected dataSourceService: TableDataService) {

    this.columns = [
      {
        field: 'invoiceNumber',
        value: 'Invoice Number'
      },
      {
        field: 'invoiceDate',
        value: 'Invoice Date'
      },
      {
        field: 'distributorName',
        value: 'Distributor Name'
      },
      {
        field: 'distributorAddress',
        value: 'Distributor Address'
      },
      {
        field: 'customerName',
        value: 'Customer Name'
      },
      {
        field: 'customerAddress',
        value: 'Customer Address'
      },
      {
        field: 'manufacturerName',
        value: 'Manufacturer Name'
      },
      {
        field: 'productCode',
        value: 'Product Code'
      },
      {
        field: 'productDescription',
        value: 'Product Description'
      },
      {
        field: 'unitOfMeasure',
        value: 'Invoice Number'
      },
      {
        field: 'purchaseQty',
        value: 'Purchase Qty'
      },
      {
        field: 'purchasedWeight',
        value: 'Purchase Weight'
      },
      {
        field: 'unitPrice',
        value: 'Unit Price'
      },
      {
        field: 'totalPrice',
        value: 'Total Price'
      },
    ];
    this.displayedColumns = this.columns.map(column => column.field);
    this.groupByColumns = [];
  }

  options = [
    {name:'Invoice', value:'invoiceNumber', checked:false},
    {name:'Distributor', value:'distributorName', checked:false},
    {name:'Customer Location', value:'customerAddress', checked:false},
    {name:'Product', value:'productCode', checked:false},
  ]

  groupRows() {
    const result = this.options.filter(opt => opt.checked).map(opt => opt.value);
    console.log(result);

    this.groupByColumns = result;

    this.dataSource.data = this.addGroups(this._alldata, this.groupByColumns);
    this.dataSource.filter = performance.now().toString();
  }

  customFilterPredicate(data: any | Group, filter: string): boolean {
    return (data instanceof Group) ? data.visible : this.getDataRowVisible(data);
  }

  getDataRowVisible(data): boolean {
    const groupRows = this.dataSource.data.filter(
      row => {
        if (!(row instanceof Group)) {
          return false;
        }
        let match = true;
        this.groupByColumns.forEach(column => {
          if (!row[column] || !data[column] || row[column] !== data[column]) {
            match = false;
          }
        });
        return match;
      }
    );

    if (groupRows.length === 0) {
      return true;
    }
    const parent = groupRows[0] as Group;
    return parent.visible && parent.expanded;
  }

  groupHeaderClick(row) {
    row.expanded = !row.expanded;
    this.dataSource.filter = performance.now().toString();
  }

  addGroups(data: any[], groupByColumns: string[]): any[] {
    const rootGroup = new Group();
    rootGroup.expanded = true;
    return this.getSublevel(data, 0, groupByColumns, rootGroup);
  }

  getSublevel(data: any[], level: number, groupByColumns: string[], parent: Group): any[] {
    if (level >= groupByColumns.length) {
      return data;
    }
    const groups = this.uniqueBy(
      data.map(
        row => {
          const result = new Group();
          result.level = level + 1;
          result.parent = parent;
          for (let i = 0; i <= level; i++) {
            result[groupByColumns[i]] = row[groupByColumns[i]];
          }
          return result;
        }
      ),
      JSON.stringify);

    const currentColumn = groupByColumns[level];
    let subGroups = [];
    groups.forEach(group => {
      const rowsInGroup = data.filter(row => group[currentColumn] === row[currentColumn]);
      group.totalCounts = rowsInGroup.length;
      const subGroup = this.getSublevel(rowsInGroup, level + 1, groupByColumns, group);
      subGroup.unshift(group);
      subGroups = subGroups.concat(subGroup);
    });
    return subGroups;
  }

  uniqueBy(a, key) {
    const seen = {};
    return a.filter((item) => {
      const k = key(item);
      return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    });
  }

  isGroup(index, item): boolean {
    return item.level;
  }

  ngOnInit(){

    this.dataSourceService.getMongoData()
    .subscribe(
      (data: any) => {
          data.forEach((item, index) => {
            item.id = index + 1;
          });
          this._alldata = data;
          this.dataSource.data = this.addGroups(this._alldata, this.groupByColumns);
          this.dataSource.filterPredicate = this.customFilterPredicate.bind(this);
          this.dataSource.filter = performance.now().toString();
        },
      (err: any) => console.log(err)
    );
  }
}

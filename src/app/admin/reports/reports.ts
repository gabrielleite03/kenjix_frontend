import {ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject, PLATFORM_ID, AfterViewInit} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import * as d3 from 'd3';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css', '../admin-shared.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reports implements AfterViewInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  private platformId = inject(PLATFORM_ID);

  reportCards = [
    { title: 'Vendas Mensais', value: 'R$ 45.280', trend: '+12%', icon: 'trending_up', color: 'text-emerald-600' },
    { title: 'Ticket Médio', value: 'R$ 158,50', trend: '+5%', icon: 'payments', color: 'text-blue-600' },
    { title: 'Novos Clientes', value: '124', trend: '+18%', icon: 'group_add', color: 'text-purple-600' },
    { title: 'Taxa de Conversão', value: '3.2%', trend: '-1%', icon: 'analytics', color: 'text-amber-600' },
  ];

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.createChart();
    }
  }

  private createChart() {
    const data = [
      { date: 'Jan', sales: 4000 },
      { date: 'Fev', sales: 3000 },
      { date: 'Mar', sales: 5000 },
      { date: 'Abr', sales: 4500 },
      { date: 'Mai', sales: 6000 },
      { date: 'Jun', sales: 5500 },
    ];

    const element = this.chartContainer.nativeElement;
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const width = element.offsetWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint()
      .domain(data.map(d => d.date))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.sales) || 0])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .attr('color', '#94a3b8');

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `R$ ${d}`))
      .attr('color', '#94a3b8');

    const line = d3.line<{date: string, sales: number}>()
      .x(d => x(d.date) || 0)
      .y(d => y(d.sales))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#13daec')
      .attr('stroke-width', 3)
      .attr('d', line);

    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.date) || 0)
      .attr('cy', d => y(d.sales))
      .attr('r', 5)
      .attr('fill', '#13daec')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);
  }
}

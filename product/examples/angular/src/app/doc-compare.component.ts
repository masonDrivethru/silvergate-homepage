import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createCompare, mountToolbar, mountChangeList, type CompareController } from '@silvergate/compare-dom';

interface Step { id: string; name: string; text: string }
interface Doc { title: string; version: string; steps: Step[] }

@Component({
  selector: 'app-doc-compare',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="sgc-viewer" style="--sgc-height:80vh">
    <div #bar></div>
    <div class="sgc-body">
      <div class="sgc-panes sgc-panes--one">
        <section class="sgc-pane sgc-both">
          <div #desk class="sgc-shared" tabindex="0">
            <div class="sgc-col sgc-col--left"><div #left>
              <ng-container *ngTemplateOutlet="docTpl; context: { $implicit: before }"></ng-container>
            </div></div>
            <div class="sgc-col sgc-col--right"><div #right>
              <ng-container *ngTemplateOutlet="docTpl; context: { $implicit: after }"></ng-container>
            </div></div>
          </div>
        </section>
      </div>
      <aside #list></aside>
    </div>
  </div>

  <!-- 고객사가 이미 가진 문서 화면을 그대로 -->
  <ng-template #docTpl let-doc>
    <section class="page" *ngIf="doc">
      <h2>{{ doc.title }}</h2>
      <table>
        <tr><th>단계</th><th>지시</th></tr>
        <tr *ngFor="let s of doc.steps" [attr.data-sgc-key]="s.id"><td>{{ s.name }}</td><td>{{ s.text }}</td></tr>
      </table>
    </section>
  </ng-template>`,
})
export class DocCompareComponent implements AfterViewInit, OnDestroy {
  @Input() before?: Doc;
  @Input() after?: Doc;
  @ViewChild('left') left!: ElementRef<HTMLElement>;
  @ViewChild('right') right!: ElementRef<HTMLElement>;
  @ViewChild('desk') desk!: ElementRef<HTMLElement>;
  @ViewChild('bar') bar!: ElementRef<HTMLElement>;
  @ViewChild('list') list!: ElementRef<HTMLElement>;
  private ctrl?: CompareController;
  private ui: Array<{ destroy(): void }> = [];

  constructor(private zone: NgZone) {}

  ngAfterViewInit() {
    // 스크롤·관찰 이벤트가 Angular 변경 감지를 매번 돌리지 않도록 zone 밖에서
    this.zone.runOutsideAngular(() => {
      const c = createCompare({
        left: this.left.nativeElement, right: this.right.nativeElement,
        leftScroller: this.desk.nativeElement, rightScroller: this.desk.nativeElement,
        page: '.page', watch: true, locale: 'ko',
      });
      this.ui.push(mountToolbar(this.bar.nativeElement, c, { locale: 'ko' }));
      this.ui.push(mountChangeList(this.list.nativeElement, c, { locale: 'ko' }));
      this.ctrl = c;
    });
  }

  ngOnDestroy() { this.ui.forEach((u) => u.destroy()); this.ctrl?.destroy(); }
}

<template>
  <!-- ===== 3. Solutions: 템플릿 버전 비교. 스크롤하면 변경점이 하나씩 강조됨 (data-c = 변경 순서) ===== -->
  <section class="pin pin--diff" id="solutions" data-scroll="diff" aria-labelledby="sol-title">
    <div class="pin__stage">
      <div class="container diffx">
        <p class="product__name">SilverBio Compare</p>
        <h2 id="sol-title" class="diffx__title">{{ $t('diff.title') }}</h2>

        <ol class="dtabs" :aria-label="$t('a.templates')">
          <li class="is-on" role="button" tabindex="0">{{ $t('dtab.1') }}</li>
          <li role="button" tabindex="0">{{ $t('dtab.2') }}</li>
          <li role="button" tabindex="0">{{ $t('dtab.3') }}</li>
        </ol>
        <div class="dtrack-wrap">
        <div class="dtrack">
          <div class="dslide">
            <div class="diffx__panes">
              <section class="pane pane--old" aria-label="v1.2">
                <header class="pane__head">
                  <span class="pane__doc">{{ $t('diff.doc') }}</span>
                  <span class="pane__ver">v1.2</span>
                  <span class="pane__status">{{ $t('diff.approved') }}</span>
                </header>
                <ol class="rows">
                  <li class="row"><span class="row__no">1</span><span class="row__step">{{ $t('diff.s1') }}</span><span class="row__val">12.10 g</span></li>
                  <li class="row row--old" data-c="1"><span class="row__no">2</span><span class="row__step">{{ $t('diff.s7') }}</span><span class="row__val">8.77 g</span></li>
                  <li class="row row--old" data-c="2"><span class="row__no">3</span><span class="row__step">{{ $t('diff.s2') }}</span><span class="row__val">800 mL</span></li>
                  <li class="row row--old" data-c="3"><span class="row__no">4</span><span class="row__step">{{ $t('diff.s3') }}</span><span class="row__val">7.4 ± 0.2</span></li>
                  <li class="row row--old" data-c="4"><span class="row__no">5</span><span class="row__step">{{ $t('diff.s4') }}</span><span class="row__val">15 min</span></li>
                  <li class="row row--gap" data-c="5" aria-hidden="true"></li>
                  <li class="row row--gap" data-c="6" aria-hidden="true"></li>
                  <li class="row row--del" data-c="7"><span class="row__no">6</span><span class="row__step">{{ $t('diff.s6') }}</span><span class="row__val">30 min</span></li>
                </ol>
              </section>
              <section class="pane pane--new" aria-label="v1.3">
                <header class="pane__head">
                  <span class="pane__doc">{{ $t('diff.doc') }}</span>
                  <span class="pane__ver">v1.3</span>
                  <span class="pane__stats" aria-hidden="true"><b class="s-mod">~0</b><b class="s-add">+0</b><b class="s-del">−0</b></span>
                  <span class="pane__status is-draft">{{ $t('diff.review') }}</span>
                </header>
                <ol class="rows">
                  <li class="row"><span class="row__no">1</span><span class="row__step">{{ $t('diff.s1') }}</span><span class="row__val">12.10 g</span></li>
                  <li class="row row--new" data-c="1"><span class="row__no">2</span><span class="row__step">{{ $t('diff.s7') }}</span><span class="row__val"><s class="row__was">8.77 g</s>8.80 g</span></li>
                  <li class="row row--new" data-c="2"><span class="row__no">3</span><span class="row__step">{{ $t('diff.s2') }}</span><span class="row__val"><s class="row__was">800 mL</s>850 mL</span></li>
                  <li class="row row--new" data-c="3"><span class="row__no">4</span><span class="row__step">{{ $t('diff.s3') }}</span><span class="row__val"><s class="row__was">7.4 ± 0.2</s>7.4 ± 0.1</span></li>
                  <li class="row row--new" data-c="4"><span class="row__no">5</span><span class="row__step">{{ $t('diff.s4') }}</span><span class="row__val"><s class="row__was">15 min</s>20 min</span></li>
                  <li class="row row--add" data-c="5"><span class="row__no">6</span><span class="row__step">{{ $t('diff.s8') }}</span><span class="row__val">14–16 mS/cm</span></li>
                  <li class="row row--add" data-c="6"><span class="row__no">7</span><span class="row__step">{{ $t('diff.s5') }}</span><span class="row__val">0.22 µm</span></li>
                  <li class="row row--gap" data-c="7"><span class="row__ghost">{{ $t('diff.s6') }}</span></li>
                </ol>
              </section>
            </div>
            <ol class="diffx__log">
              <li data-c="1" role="button" tabindex="0"><b aria-hidden="true">~</b><span>{{ $t('diff.l1') }}</span></li>
              <li data-c="2" role="button" tabindex="0"><b aria-hidden="true">~</b><span>{{ $t('diff.l2') }}</span></li>
              <li data-c="3" role="button" tabindex="0"><b aria-hidden="true">~</b><span>{{ $t('diff.l3') }}</span></li>
              <li data-c="4" role="button" tabindex="0"><b aria-hidden="true">~</b><span>{{ $t('diff.l4') }}</span></li>
              <li data-c="5" role="button" tabindex="0" class="is-add"><b aria-hidden="true">+</b><span>{{ $t('diff.l5') }}</span></li>
              <li data-c="6" role="button" tabindex="0" class="is-add"><b aria-hidden="true">+</b><span>{{ $t('diff.l6') }}</span></li>
              <li data-c="7" role="button" tabindex="0" class="is-del"><b aria-hidden="true">−</b><span>{{ $t('diff.l7') }}</span></li>
            </ol>
          </div>
          <div class="dslide">
            <div class="diffx__panes">
              <section class="pane pane--old" aria-label="v4.0">
                <header class="pane__head">
                  <span class="pane__doc">{{ $t('d2.doc') }}</span>
                  <span class="pane__ver">v4.0</span>
                  <span class="pane__status">{{ $t('diff.approved') }}</span>
                </header>
                <ol class="rows">
                  <li class="row"><span class="row__no">1</span><span class="row__step">{{ $t('d2.s1') }}</span><span class="row__val">5 min</span></li>
                  <li class="row row--old" data-c="1"><span class="row__no">2</span><span class="row__step">{{ $t('d2.s2') }}</span><span class="row__val">1%</span></li>
                  <li class="row row--old" data-c="2"><span class="row__no">3</span><span class="row__step">{{ $t('d2.s3') }}</span><span class="row__val">60 °C</span></li>
                  <li class="row"><span class="row__no">4</span><span class="row__step">{{ $t('d2.s4') }}</span><span class="row__val">3 cycles</span></li>
                  <li class="row row--gap" data-c="3" aria-hidden="true"></li>
                  <li class="row row--gap" data-c="4" aria-hidden="true"></li>
                  <li class="row row--del" data-c="5"><span class="row__no">5</span><span class="row__step">{{ $t('d2.s7') }}</span><span class="row__val">12 h</span></li>
                </ol>
              </section>
              <section class="pane pane--new" aria-label="v4.1">
                <header class="pane__head">
                  <span class="pane__doc">{{ $t('d2.doc') }}</span>
                  <span class="pane__ver">v4.1</span>
                  <span class="pane__stats" aria-hidden="true"><b class="s-mod">~0</b><b class="s-add">+0</b><b class="s-del">−0</b></span>
                  <span class="pane__status is-draft">{{ $t('diff.review') }}</span>
                </header>
                <ol class="rows">
                  <li class="row"><span class="row__no">1</span><span class="row__step">{{ $t('d2.s1') }}</span><span class="row__val">5 min</span></li>
                  <li class="row row--new" data-c="1"><span class="row__no">2</span><span class="row__step">{{ $t('d2.s2') }}</span><span class="row__val"><s class="row__was">1%</s>2%</span></li>
                  <li class="row row--new" data-c="2"><span class="row__no">3</span><span class="row__step">{{ $t('d2.s3') }}</span><span class="row__val"><s class="row__was">60 °C</s>70 °C</span></li>
                  <li class="row"><span class="row__no">4</span><span class="row__step">{{ $t('d2.s4') }}</span><span class="row__val">3 cycles</span></li>
                  <li class="row row--add" data-c="3"><span class="row__no">5</span><span class="row__step">{{ $t('d2.s5') }}</span><span class="row__val">≤ 500 ppb</span></li>
                  <li class="row row--add" data-c="4"><span class="row__no">6</span><span class="row__step">{{ $t('d2.s6') }}</span><span class="row__val">QA</span></li>
                  <li class="row row--gap" data-c="5"><span class="row__ghost">{{ $t('d2.s7') }}</span></li>
                </ol>
              </section>
            </div>
            <ol class="diffx__log">
              <li data-c="1" role="button" tabindex="0"><b aria-hidden="true">~</b><span>{{ $t('d2.l1') }}</span></li>
              <li data-c="2" role="button" tabindex="0"><b aria-hidden="true">~</b><span>{{ $t('d2.l2') }}</span></li>
              <li data-c="3" role="button" tabindex="0" class="is-add"><b aria-hidden="true">+</b><span>{{ $t('d2.l3') }}</span></li>
              <li data-c="4" role="button" tabindex="0" class="is-add"><b aria-hidden="true">+</b><span>{{ $t('d2.l4') }}</span></li>
              <li data-c="5" role="button" tabindex="0" class="is-del"><b aria-hidden="true">−</b><span>{{ $t('d2.l5') }}</span></li>
            </ol>
          </div>
          <div class="dslide">
            <div class="diffx__panes">
              <section class="pane pane--old" aria-label="v2.0">
                <header class="pane__head">
                  <span class="pane__doc">{{ $t('d3.doc') }}</span>
                  <span class="pane__ver">v2.0</span>
                  <span class="pane__status">{{ $t('diff.approved') }}</span>
                </header>
                <ol class="rows">
                  <li class="row"><span class="row__no">1</span><span class="row__step">{{ $t('d3.s1') }}</span><span class="row__val">White, round</span></li>
                  <li class="row row--del" data-c="1"><span class="row__no">2</span><span class="row__step">{{ $t('d3.s2') }}</span><span class="row__val">Conforms</span></li>
                  <li class="row row--gap" data-c="2" aria-hidden="true"></li>
                  <li class="row row--old" data-c="3"><span class="row__no">3</span><span class="row__step">{{ $t('d3.s4') }}</span><span class="row__val">95.0–105.0%</span></li>
                  <li class="row row--old" data-c="4"><span class="row__no">4</span><span class="row__step">{{ $t('d3.s5') }}</span><span class="row__val">Q = 75%</span></li>
                  <li class="row"><span class="row__no">5</span><span class="row__step">{{ $t('d3.s6') }}</span><span class="row__val">8–12 kp</span></li>
                  <li class="row row--gap" data-c="5" aria-hidden="true"></li>
                </ol>
              </section>
              <section class="pane pane--new" aria-label="v2.1">
                <header class="pane__head">
                  <span class="pane__doc">{{ $t('d3.doc') }}</span>
                  <span class="pane__ver">v2.1</span>
                  <span class="pane__stats" aria-hidden="true"><b class="s-mod">~0</b><b class="s-add">+0</b><b class="s-del">−0</b></span>
                  <span class="pane__status is-draft">{{ $t('diff.review') }}</span>
                </header>
                <ol class="rows">
                  <li class="row"><span class="row__no">1</span><span class="row__step">{{ $t('d3.s1') }}</span><span class="row__val">White, round</span></li>
                  <li class="row row--gap" data-c="1"><span class="row__ghost">{{ $t('d3.s2') }}</span></li>
                  <li class="row row--add" data-c="2"><span class="row__no">2</span><span class="row__step">{{ $t('d3.s3') }}</span><span class="row__val">Conforms</span></li>
                  <li class="row row--new" data-c="3"><span class="row__no">3</span><span class="row__step">{{ $t('d3.s4') }}</span><span class="row__val"><s class="row__was">95.0–105.0%</s>97.0–103.0%</span></li>
                  <li class="row row--new" data-c="4"><span class="row__no">4</span><span class="row__step">{{ $t('d3.s5') }}</span><span class="row__val"><s class="row__was">Q = 75%</s>Q = 80%</span></li>
                  <li class="row"><span class="row__no">5</span><span class="row__step">{{ $t('d3.s6') }}</span><span class="row__val">8–12 kp</span></li>
                  <li class="row row--add" data-c="5"><span class="row__no">6</span><span class="row__step">{{ $t('d3.s7') }}</span><span class="row__val">≤ 0.03 ppm</span></li>
                </ol>
              </section>
            </div>
            <ol class="diffx__log">
              <li data-c="1" role="button" tabindex="0" class="is-del"><b aria-hidden="true">−</b><span>{{ $t('d3.l1') }}</span></li>
              <li data-c="2" role="button" tabindex="0" class="is-add"><b aria-hidden="true">+</b><span>{{ $t('d3.l2') }}</span></li>
              <li data-c="3" role="button" tabindex="0"><b aria-hidden="true">~</b><span>{{ $t('d3.l3') }}</span></li>
              <li data-c="4" role="button" tabindex="0"><b aria-hidden="true">~</b><span>{{ $t('d3.l4') }}</span></li>
              <li data-c="5" role="button" tabindex="0" class="is-add"><b aria-hidden="true">+</b><span>{{ $t('d3.l5') }}</span></li>
            </ol>
          </div>
        </div>
        </div>
        <p class="diffx__sample">{{ $t('diff.hint') }}</p>
      </div>
    </div>
  </section>
</template>

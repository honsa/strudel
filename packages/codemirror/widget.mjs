import { StateEffect, StateField } from '@codemirror/state';
import { Decoration, EditorView, WidgetType } from '@codemirror/view';

const getWidgetID = (from) => `widget_${from}`;

export const addWidget = StateEffect.define({
  map: ({ from, to }, change) => {
    return { from: change.mapPos(from), to: change.mapPos(to) };
  },
});

export const updateWidgets = (view, widgets) => {
  view.dispatch({ effects: addWidget.of(widgets) });
};

function getWidgets(widgetConfigs) {
  return widgetConfigs.map(({ to, type }) => {
    return Decoration.widget({
      widget: new BlockWidget(to, type),
      side: 0,
      block: true,
    }).range(to);
  });
}

const widgetField = StateField.define(
  /* <DecorationSet> */ {
    create() {
      return Decoration.none;
    },
    update(widgets, tr) {
      widgets = widgets.map(tr.changes);
      for (let e of tr.effects) {
        if (e.is(addWidget)) {
          try {
            widgets = widgets.update({
              filter: () => false,
              add: getWidgets(e.value),
            });
          } catch (error) {
            console.log('err', error);
          }
        }
      }
      return widgets;
    },
    provide: (f) => EditorView.decorations.from(f),
  },
);

export class BlockWidget extends WidgetType {
  constructor(col, type) {
    super();
    this.col = col;
    this.type = type;
  }
  eq() {
    return true;
  }
  toDOM() {
    const id = getWidgetID(this.col); // matches id generated in transpiler
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement(this.type);
      el.id = id;
    }
    return el;
  }
  ignoreEvent(e) {
    return true;
  }
}

export const widgetPlugin = [widgetField];

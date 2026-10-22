'use strict';
// This is a stateful test double, NOT an Android device. It never chooses actions.
const prefix = 'io.slothqa.demo:id/';
function createSimulator(variant = 'normal') {
  if (!['normal', 'changed', 'broken-save'].includes(variant)) throw Error('unknown scenario');
  let screen = 'list', title = '', notes = [], confirmation = false;
  const node = (id, text, role = 'text', more = {}) => ({nodeId: prefix + id, resourceName: prefix + id, text,
    label: text, role, enabled: true, visible: true, effectiveVisible: true, clickable: role === 'button', editable: role === 'input', ...more});
  return {
    snapshot(revision) {
      let nodes;
      if (confirmation) nodes = [node('dialog_title', 'Save this task?'), node('cancel', 'Cancel', 'button'), node('confirm', 'Confirm', 'button')];
      else if (screen === 'list') nodes = [node('heading', 'Sloth Tasks'), node('new_task', variant === 'changed' ? 'Add a task' : 'New task', 'button'), ...notes.map((t, i) => node(`task_${i}`, `Task: ${t}`))];
      else nodes = [node('heading', 'New task'), node('title', title, 'input', {label: 'Task title'}), node('save', 'Save task', 'button'), node('cancel', 'Cancel', 'button'), ...(variant === 'broken-save' && notes.length === 0 ? [node('error', 'Storage unavailable. Saving is disabled.')] : [])];
      if (variant === 'changed') nodes.reverse();
      return {ok: true, provider: 'native', rawTreeId: 'sim:' + revision, truncated: false, coverage: {source: {status: 'complete'}, projection: {truncated: false}}, nodes};
    },
    apply(action) {
      const id = action.selector.resourceName?.slice(prefix.length);
      if (action.action === 'inputText' && id === 'title' && screen === 'edit') title = action.value;
      else if (action.action === 'tap' && id === 'new_task' && screen === 'list') { screen = 'edit'; title = ''; }
      else if (action.action === 'tap' && id === 'save' && screen === 'edit' && title.trim()) {
        if (variant === 'broken-save') return {ok: true, dispatched: true};
        if (variant === 'changed') confirmation = true;
        else { notes.push(title); screen = 'list'; }
      } else if (action.action === 'tap' && id === 'confirm' && confirmation) { notes.push(title); screen = 'list'; confirmation = false; }
      else if (action.action === 'tap' && id === 'cancel') { confirmation = false; screen = 'list'; }
      else return {ok: false, dispatched: false, error: 'unsupported simulator action'};
      return {ok: true, dispatched: true};
    }
  };
}
module.exports = {createSimulator};

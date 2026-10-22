package io.slothqa.demo;

import android.app.Activity;
import android.app.AlertDialog;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;

/** Tiny, original, debug-only test target. No accounts, network calls or personal data. */
public class MainActivity extends Activity {
    private LinearLayout layout;
    private String scenario;
    private String saved;
    private EditText title;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        scenario = getIntent().getStringExtra("scenario");
        if (scenario == null) scenario = "normal";
        saved = getPreferences(MODE_PRIVATE).getString("task", "");
        showList();
    }
    private void base(String heading) {
        layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        int p = (int)(24 * getResources().getDisplayMetrics().density);
        layout.setPadding(p,p*2,p,p);
        layout.setBackgroundColor(0xfff3f2ea);
        setContentView(layout);
        text(R.id.heading, heading);
    }
    private void text(int id, String value) {
        TextView v = new TextView(this); v.setId(id); v.setText(value); v.setTextSize(22);
        v.setPadding(0,18,0,18); layout.addView(v);
    }
    private void button(int id,String label,View.OnClickListener listener) {
        Button b=new Button(this); b.setId(id); b.setText(label); b.setContentDescription(label);
        b.setOnClickListener(listener); layout.addView(b);
    }
    private void showList() {
        base("Sloth Tasks");
        if(!saved.isEmpty())text(R.id.task_0,"Task: "+saved);
        button(R.id.new_task,"changed".equals(scenario)?"Add a task":"New task",v->showEditor());
    }
    private void showEditor() {
        base("New task");
        title=new EditText(this); title.setId(R.id.title); title.setSingleLine(true);
        title.setHint("Task title"); title.setContentDescription("Task title"); layout.addView(title);
        if("changed".equals(scenario))button(R.id.cancel,"Cancel",v->showList());
        button(R.id.save,"Save task",v->save());
        if(!"changed".equals(scenario))button(R.id.cancel,"Cancel",v->showList());
        if("broken-save".equals(scenario))text(R.id.error,"Storage unavailable. Saving is disabled.");
    }
    private void save() {
        if(title.getText().toString().trim().isEmpty()){title.setError("Title required");return;}
        if("broken-save".equals(scenario))return;
        if("changed".equals(scenario)) {
            AlertDialog d=new AlertDialog.Builder(this).setTitle("Save this task?")
                .setNegativeButton("Cancel",(dialog,which)->{})
                .setPositiveButton("Confirm",(dialog,which)->commit()).create();
            d.setOnShowListener(dialog->{d.getButton(AlertDialog.BUTTON_POSITIVE).setId(R.id.confirm);d.getButton(AlertDialog.BUTTON_NEGATIVE).setId(R.id.cancel);});
            d.show();
        } else commit();
    }
    private void commit(){saved=title.getText().toString();getPreferences(MODE_PRIVATE).edit().putString("task",saved).apply();showList();}
}

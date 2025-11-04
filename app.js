/* App logic: tabs, lesson checks, and simple JS runner that captures console.log output */
/* Tabs */
document.querySelectorAll('.level').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.level').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.querySelectorAll('main section.card').forEach(s=>s.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
  });
});

/* Lesson quick checks */
document.querySelectorAll('.check-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const correct = btn.dataset.answer === 'true';
    const fb = btn.closest('.card').querySelector('.feedback');
    if(correct){
      fb.textContent = 'إجابة صحيحة — ممتاز!';
      fb.style.color = '#0a8a2e';
      btn.classList.add('correct');
    } else {
      fb.textContent = 'خطأ — حاول مرة ثانية أو اضغط ترجمة لشرح الإجابة.';
      fb.style.color = '#c43a2a';
      btn.classList.add('wrong');
      // small shake
      btn.animate([{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:300});
    }
    // disable others
    btn.closest('.card').querySelectorAll('.check-btn').forEach(b=>b.disabled=true);
  });
});

/* Editor tasks definitions */
const tasks = {
  "1": {
    desc: 'اطبع النص Hello, World! باستخدام console.log',
    validator: (logs) => logs.length>0 && logs[0] === 'Hello, World!',
    hint: "استخدم: console.log('Hello, World!');"
  },
  "2": {
    desc: 'احسب مجموع 2 و 3 واطبعه (النتيجة: 5)',
    validator: (logs) => logs.length>0 && (logs[0]==='5' || logs[0]===5),
    hint: "مثال: console.log(2+3);"
  },
  "3": {
    desc: 'اكتب شرطاً يطبع "yes" إذا كانت x أكبر من 10 (x قيمته 15).',
    validator: (logs) => logs.length>0 && logs.includes('yes'),
    hint: "مثال: let x = 15; if (x > 10) { console.log('yes'); }"
  }
};

function setTask(n){
  const t = tasks[n];
  document.getElementById('taskBox').innerHTML = '<strong>المهمة '+n+':</strong> '+ t.desc + '<div class="instructions">المطلوب: ' + t.hint + '</div>';
  document.getElementById('code').value = '// اكتب كودك هنا\n';
  document.getElementById('outputArea').textContent = '';
  document.querySelector('.editor-feedback').textContent = '';
}
document.getElementById('taskSelect').addEventListener('change', function(){ setTask(this.value); });
setTask('1');

/* Safe-ish runner: capture console.log outputs and test */
function runUserCode(code){
  const logs = [];
  const sandboxConsole = {
    log: function(...args){ 
      const out = args.map(a=> (typeof a==='object'? JSON.stringify(a): String(a)) ).join(' ');
      logs.push(out);
    }
  };
  try{
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    // run in async function to allow async code if user uses it
    const runner = new AsyncFunction('console', code);
    return runner(sandboxConsole).then(()=> ({ok:true, logs})).catch((e)=> ({ok:false, error:String(e), logs}));
  }catch(e){
    return Promise.resolve({ok:false, error:String(e), logs});
  }
}

document.getElementById('runBtn').addEventListener('click', async ()=>{
  const code = document.getElementById('code').value;
  document.getElementById('outputArea').textContent = 'Running...';
  const res = await runUserCode(code);
  if(!res.ok){
    document.getElementById('outputArea').textContent = 'Error: ' + res.error;
    document.querySelector('.editor-feedback').textContent = 'الكود فيه خطأ — شوف رسالة الخطأ فوق وحاول تصلح.';
    document.querySelector('.editor-feedback').style.color = '#c43a2a';
    return;
  }
  // show logs
  document.getElementById('outputArea').textContent = res.logs.join('\n') || '(لا مخرجات)';
  // validate against current task
  const t = document.getElementById('taskSelect').value;
  const pass = tasks[t].validator(res.logs);
  if(pass){
    document.querySelector('.editor-feedback').textContent = '✅ إجابة صحيحة! ممتاز.';
    document.querySelector('.editor-feedback').style.color = '#0a8a2e';
    // animate run button
    document.getElementById('runBtn').animate([{transform:'scale(1)'},{transform:'scale(1.05)'},{transform:'scale(1)'}],{duration:300});
  }else{
    document.querySelector('.editor-feedback').textContent = '❌ غير صحيح بعد — جرّب مرة ثانية أو اضغط Reset أو شغّل hint.';
    document.querySelector('.editor-feedback').style.color = '#c43a2a';
  }
});

document.getElementById('resetBtn').addEventListener('click', ()=>{
  setTask(document.getElementById('taskSelect').value);
});

// simple translate/help: show hints when user clicks translation in lessons
document.querySelectorAll('#lesson1 .check-btn, #lesson2 .check-btn, #lesson3 .check-btn, #lesson4 .check-btn').forEach(b=>{
  b.addEventListener('click', ()=>{
    const fb = b.closest('.card').querySelector('.feedback');
    if(b.classList.contains('wrong')){
      // show small hint
      fb.innerHTML += ' <button class="hint-btn">عرض شرح</button>';
      const hintBtn = fb.querySelector('.hint-btn');
      hintBtn.addEventListener('click', ()=>{
        fb.innerHTML += '<div class="hint">الشرح: هذه الإجابة غير صحيحة لأن ...</div>';
      });
    }
  });
});

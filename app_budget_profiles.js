(function(){
  const $ = sel => document.querySelector(sel);
  const id = s => document.getElementById(s);
  const num = v => { if(v==null) return 0; const n = Number(String(v).replace(',','.')); return isFinite(n)?n:0; };
  const EUR = n => (n||0).toLocaleString('de-DE',{maximumFractionDigits:0});
  const PCT = n => (n||0).toLocaleString('de-DE',{maximumFractionDigits:1})+' %';

  const PROFILES = {
    student_berlin:{region:"Berlin", gross:1200,dedRate:12,sqm:28,rentPerSqm:16,utilities:140,mobility:49,groceries:230,comms:30,clothes:35,leisure:100,health:30,saving:50,other:60},
    azubi_bb:{region:"Brandenburg", gross:1133,dedRate:16,sqm:35,rentPerSqm:7.5,utilities:140,mobility:120,groceries:220,comms:40,clothes:40,leisure:90,health:35,saving:80,other:60},
    geselle_sn:{region:"Sachsen", gross:2600,dedRate:22,sqm:45,rentPerSqm:8.1,utilities:170,mobility:180,groceries:280,comms:45,clothes:55,leisure:130,health:40,saving:200,other:90},
    akademiker_be:{region:"Berlin", gross:4600,dedRate:32,sqm:45,rentPerSqm:17.5,utilities:170,mobility:120,groceries:320,comms:50,clothes:70,leisure:180,health:50,saving:600,other:120},
    akademiker_fam_be:{region:"Berlin", gross:5500,dedRate:33,sqm:75,rentPerSqm:16.5,utilities:260,mobility:260,groceries:650,comms:70,clothes:120,leisure:220,health:80,saving:800,other:160},
    einzelhandel:{region:"Deutschland", gross:2400,dedRate:21,sqm:40,rentPerSqm:10,utilities:160,mobility:120,groceries:260,comms:40,clothes:50,leisure:110,health:40,saving:150,other:80},
    oeff_dienst:{region:"Deutschland", gross:3800,dedRate:28,sqm:50,rentPerSqm:11.5,utilities:190,mobility:140,groceries:320,comms:45,clothes:70,leisure:150,health:55,saving:450,other:120},
    oev:{region:"Deutschland", gross:3300,dedRate:26,sqm:48,rentPerSqm:10.8,utilities:185,mobility:160,groceries:300,comms:45,clothes:60,leisure:140,health:50,saving:350,other:110},
    rentner_by:{region:"Bayern", gross:2800,dedRate:14,sqm:55,rentPerSqm:12,utilities:200,mobility:110,groceries:300,comms:40,clothes:45,leisure:140,health:90,saving:200,other:80}
  };

  function compute(){
    const gross = num(id('gross').value);
    const ded = num(id('dedRate').value)/100;
    const net = Math.max(0, gross*(1-ded));
    const warm = num(id('sqm').value)*num(id('rentPerSqm').value)+num(id('utilities').value);
    const data = {
      housing:warm, mobility:num(id('mobility').value), groceries:num(id('groceries').value),
      comms:num(id('comms').value), clothes:num(id('clothes').value), leisure:num(id('leisure').value),
      health:num(id('health').value), saving:num(id('saving').value), other:num(id('other').value)
    };
    const sum = Object.values(data).reduce((a,b)=>a+b,0);
    const afterHousing = Math.max(0, net - warm);
    const saveRate = net>0 ? data.saving/net*100 : 0;

    id('netto').textContent = EUR(net)+' €';
    id('rentWarm').textContent = EUR(warm)+' €';
    id('afterHousing').textContent = EUR(afterHousing)+' €';
    id('saveRate').textContent = PCT(saveRate);

    const tbody = $('#tbl tbody'); tbody.innerHTML='';
    const cats=[['Wohnen (warm)','housing'],['Mobilität','mobility'],['Lebensmittel & Haushalt','groceries'],['Kommunikation','comms'],
                ['Kleidung & Schuhe','clothes'],['Freizeit, Sport & Kultur','leisure'],['Gesundheit & Versicherungen','health'],
                ['Sparen / Rücklage','saving'],['Sonstiges','other']];
    cats.forEach(([label,key])=>{
      const v = data[key]; const share = net>0? v/net*100:0;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${label}</td><td>${EUR(v)} €</td><td>${PCT(share)}</td>`;
      tbody.appendChild(tr);
    });
    id('sumEur').textContent = EUR(sum)+' €';
    id('sumPct').textContent = net>0 ? PCT(sum/net*100) : '–';

    drawDonut(data);
  }

  function drawDonut(data){
    const c = id('chartDonut'); const ctx = c.getContext('2d');
    const dpr = window.devicePixelRatio||1; c.width = Math.round(c.clientWidth*dpr); c.height = Math.round(c.clientHeight*dpr);
    const W=c.width,H=c.height,cx=W/2,cy=H/2,r=Math.min(cx,cy)-10*dpr;
    ctx.clearRect(0,0,W,H);
    const vals=[data.housing,data.mobility,data.groceries,data.comms,data.clothes,data.leisure,data.health,data.saving,data.other];
    const total = vals.reduce((a,b)=>a+b,0)||1;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.strokeStyle="#222943"; ctx.lineWidth=22*dpr; ctx.stroke();
    const cols=['#6ea8fe','#6efed3','#fdd87c','#ff9db7','#b79cff','#9ee07a','#9cd7ff','#f7a976','#e0e2ff'];
    let start=-Math.PI/2;
    vals.forEach((v,i)=>{
      const end = start + (v/total)*Math.PI*2;
      ctx.beginPath(); ctx.strokeStyle=cols[i%cols.length]; ctx.lineWidth=22*dpr; ctx.arc(cx,cy,r,start,end); ctx.stroke();
      start=end;
    });
  }

  function loadDefaults(){
    const p = PROFILES[id('profile').value] || PROFILES.azubi_bb;
    id('pillRegion').textContent = 'Region: '+p.region;
    id('gross').value = p.gross;
    id('dedRate').value = p.dedRate; id('dedLbl').textContent = p.dedRate+' %';
    id('sqm').value = p.sqm;
    id('rentPerSqm').value = p.rentPerSqm;
    id('utilities').value = p.utilities;
    id('mobility').value = p.mobility;
    id('groceries').value = p.groceries;
    id('comms').value = p.comms;
    id('clothes').value = p.clothes;
    id('leisure').value = p.leisure;
    id('health').value = p.health;
    id('saving').value = p.saving;
    id('other').value = p.other;
    compute();
  }

  function normalize(){
    const gross = num(id('gross').value);
    const net = Math.max(0, gross*(1 - num(id('dedRate').value)/100));
    const warm = num(id('sqm').value)*num(id('rentPerSqm').value)+num(id('utilities').value);
    const saving = num(id('saving').value);
    const remain = Math.max(0, net - warm - saving);
    const keys=['mobility','groceries','comms','clothes','leisure','health','other'];
    const current = keys.map(k=> num(id(k).value));
    const curSum = current.reduce((a,b)=>a+b,0) || 1;
    keys.forEach((k,i)=> id(k).value = Math.round(current[i]/curSum*remain));
    compute();
  }

  function diag(){
    const out = {
      readyState: document.readyState,
      ua: navigator.userAgent,
      profile: id('profile').value,
      values: {
        gross:id('gross').value, dedRate:id('dedRate').value, sqm:id('sqm').value,
        rentPerSqm:id('rentPerSqm').value, utilities:id('utilities').value
      }
    };
    id('diagOut').textContent = JSON.stringify(out,null,2);
  }

  function bind(){
    id('profile').addEventListener('change', loadDefaults);
    ['gross','dedRate','sqm','rentPerSqm','utilities','mobility','groceries','comms','clothes','leisure','health','saving','other']
      .forEach(k=> id(k).addEventListener('input', compute));
    id('btnDefaults').addEventListener('click', loadDefaults);
    id('btnNormalize').addEventListener('click', normalize);
    id('btnDiag').addEventListener('click', diag);
  }

  document.addEventListener('DOMContentLoaded', function(){
    try{
      bind();
      id('profile').value = 'azubi_bb';
      loadDefaults();
      diag();
    }catch(e){
      id('err').style.display='block';
      id('jsfail').style.display='block';
      id('diagOut').textContent = 'Init error: '+e.message;
    }
  });
})();
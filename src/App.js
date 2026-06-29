import React, { useState, useEffect, useMemo } from 'react';
import { Upload, FileDown, Trash2, BarChart3, AlertCircle, Save, Image as ImageIcon, Calculator, Search, Users, PieChart } from 'lucide-react';

const IGNORE_NAMES = ['konica', 'boxadmin', 'konica360', 'public'];

// 🛑 รายชื่อพนักงานที่ลาออก หรือไม่ต้องการให้แสดงใน "กราฟบุคคล" (พิมพ์ตัวพิมพ์เล็กทั้งหมด)
const HIDE_USERS = ['ใส่ชื่อคนที่1', 'ใส่ชื่อคนที่2'];

// 🏢 ฐานข้อมูลแผนก (อ้างอิงจาก PDF)
const DEPARTMENT_MAP = {
  // MD Office
  'sittichai': 'MD Office', 'sicha': 'MD Office', 'jantana': 'MD Office', 'maytinee': 'MD Office', 'thitapa': 'MD Office', 'siramol': 'MD Office', 'jeerasak': 'MD Office', 'phariya': 'MD Office', 'phongchathep': 'MD Office',
  // Support
  'anjana': 'Support', 'nantipa': 'Support',
  // SSE1
  'naraes': 'SSE1', 'jariyaporn': 'SSE1', 'chanistha': 'SSE1', 'pattarapol': 'SSE1', 'patthawee': 'SSE1', 'gewalin': 'SSE1',
  // SSE2
  'suparat': 'SSE2', 'saowalak': 'SSE2', 'nutchanon': 'SSE2', 'thanick': 'SSE2',
  // SSE3
  'pitak': 'SSE3', 'wassana': 'SSE3', 'thanaporn': 'SSE3', 'sirikul': 'SSE3',
  // SSE4
  'nuchnapa': 'SSE4', 'pituwan': 'SSE4', 'thitima': 'SSE4', 'isaree': 'SSE4', 'sirivimol': 'SSE4',
  // Purchasing
  'rattana': 'Purchasing', 'srirat': 'Purchasing', 'onnarin': 'Purchasing', 'benjawan': 'Purchasing', 'apichaya': 'Purchasing', 'treepittaporn': 'Purchasing', 'chananchida': 'Purchasing',
  // Accounting & Finance
  'somying': 'Accounting & Finance', 'onnapa': 'Accounting & Finance', 'suchanan': 'Accounting & Finance', 'chollatorn': 'Accounting & Finance',
  // HR & Admin
  'lawan': 'HR & Admin', 'kannikar': 'HR & Admin', 'panida': 'HR & Admin', 'kornthep': 'HR & Admin',
  // IT
  'suwat': 'IT', 'worakeat': 'IT', 'kittipat': 'IT',
  // Material Planning
  'kotchapan': 'Material Planning', 'panuwat': 'Material Planning', 'woragamol': 'Material Planning',
  // Material Management
  'amarin': 'Material Management', 'tanit': 'Material Management', 'theerawut': 'Material Management', 'chavarit': 'Material Management', 'veerachet': 'Material Management', 'sittisak': 'Material Management', 'satean': 'Material Management', 'jessada': 'Material Management', 'sittithep': 'Material Management', 'apichai': 'Material Management', 'pichai': 'Material Management', 'vutthikri': 'Material Management',
  // Songkla Branch
  'monkawee': 'Songkla Branch', 'tammasarn': 'Songkla Branch'
};

const DEPARTMENTS = ['All', 'MD Office', 'Support', 'SSE1', 'SSE2', 'SSE3', 'SSE4', 'Purchasing', 'Accounting & Finance', 'HR & Admin', 'IT', 'Material Planning', 'Material Management', 'Songkla Branch', 'Others'];

// ข้อมูลจำลองเพื่อให้กราฟแสดงทันที
const DUMMY_HISTORY = [
  { month: 'Jan-2026', copy: 1146, print: 28475, color: 173, black: 29448, total: 29621, users: [{name: 'rattana', copy: 107, print: 40, color: 7, black: 140, total: 294}, {name: 'srirat', copy: 68, print: 89, color: 0, black: 157, total: 314}, {name: 'benjawan', copy: 48, print: 187, color: 0, black: 235, total: 470}, {name: 'apichaya', copy: 15, print: 340, color: 0, black: 355, total: 710}] },
  { month: 'Feb-2026', copy: 2389, print: 26591, color: 240, black: 28740, total: 28980, users: [{name: 'rattana', copy: 32, print: 29, color: 5, black: 32, total: 98}, {name: 'srirat', copy: 22, print: 247, color: 0, black: 269, total: 538}, {name: 'benjawan', copy: 46, print: 49, color: 0, black: 49, total: 144}, {name: 'apichaya', copy: 18, print: 442, color: 0, black: 449, total: 909}] },
  { month: 'Mar-2026', copy: 3152, print: 34827, color: 2163, black: 35810, total: 37979, users: [{name: 'rattana', copy: 39, print: 29, color: 9, black: 29, total: 106}, {name: 'srirat', copy: 53, print: 133, color: 0, black: 186, total: 372}, {name: 'benjawan', copy: 42, print: 56, color: 0, black: 56, total: 154}, {name: 'apichaya', copy: 22, print: 499, color: 0, black: 517, total: 1038}] },
  { month: 'Apr-2026', copy: 1658, print: 21043, color: 124, black: 22577, total: 22701, users: [{name: 'rattana', copy: 0, print: 0, color: 0, black: 0, total: 0}, {name: 'srirat', copy: 20, print: 20, color: 0, black: 20, total: 60}, {name: 'benjawan', copy: 38, print: 47, color: 0, black: 47, total: 132}, {name: 'apichaya', copy: 34, print: 429, color: 0, black: 463, total: 926}] },
  { month: 'May-2026', copy: 832, print: 25933, color: 243, black: 26522, total: 26765, users: [{name: 'rattana', copy: 0, print: 0, color: 0, black: 0, total: 0}, {name: 'srirat', copy: 30, print: 256, color: 0, black: 286, total: 572}, {name: 'benjawan', copy: 15, print: 340, color: 0, black: 355, total: 710}, {name: 'apichaya', copy: 41, print: 330, color: 0, black: 371, total: 742}] },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TH_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const YEARS = ['2024', '2025', '2026', '2027'];

// สีตามตัวอย่างภาพของคุณ
const COLORS = {
  copy: '#faa555',   // สีส้ม
  print: '#55b2ca',  // สีฟ้า
  color: '#9571b0',  // สีม่วง
  black: '#bc5b01'   // สีน้ำตาล
};

export default function App() {
  const [prevFiles, setPrevFiles] = useState([null, null, null]);
  const [currFiles, setCurrFiles] = useState([null, null, null]);
  
  const [tableData, setTableData] = useState([]);
  const [rawPrevData, setRawPrevData] = useState([]);
  const [rawCurrData, setRawCurrData] = useState([]);
  
  const [activeTab, setActiveTab] = useState('summary');
  const [historyData, setHistoryData] = useState([]);
  
  const [chartView, setChartView] = useState('overall'); // 'overall', 'individual'
  const [selectedDept, setSelectedDept] = useState('All'); // แผนกที่เลือกดู
  
  const [selMonthIdx, setSelMonthIdx] = useState(new Date().getMonth());
  const [selYear, setSelYear] = useState(new Date().getFullYear().toString());
  
  const [sortConfig, setSortConfig] = useState({ key: 'total', direction: 'desc' });
  const [error, setError] = useState('');
  const [isSavingImg, setIsSavingImg] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('konica_history');
    if (saved && JSON.parse(saved).length > 0) {
      setHistoryData(JSON.parse(saved));
    } else {
      setHistoryData(DUMMY_HISTORY);
    }
  }, []);

  const handleFileChange = (index, type, file) => {
    const newFiles = type === 'prev' ? [...prevFiles] : [...currFiles];
    newFiles[index] = file;
    type === 'prev' ? setPrevFiles(newFiles) : setCurrFiles(newFiles);
  };

  const removeFile = (index, type) => {
    const newFiles = type === 'prev' ? [...prevFiles] : [...currFiles];
    newFiles[index] = null;
    type === 'prev' ? setPrevFiles(newFiles) : setCurrFiles(newFiles);
  };

  const parseFile = async (file) => {
    if (!file) return [];
    const text = await file.text();
    const lines = text.split('\n').map(l => l.replace(/\r/g, ''));
    const data = [];
    
    for (let i = 0; i < lines.length; i++) {
      let cols = lines[i].split('\t');
      if (cols.length < 10) cols = lines[i].split(',');

      // ✅ รองรับทั้งไฟล์เครื่องสี (60+ คอลัมน์) และเครื่องขาวดำ 950i (34 คอลัมน์)
      if (cols.length >= 25) {
        let name = String(cols[0]).trim().toLowerCase();
        
        // 🔄 แปลงชื่อ ybenjawan เป็น benjawan อัตโนมัติ
        if (name === 'ybenjawan') {
          name = 'benjawan';
        }

        const totalCounter = parseInt(String(cols[1]).replace(/,/g, ''), 10);

        if (!name || name === 'user name' || name === 'name' || name.includes('total') || name.includes('รวม') || isNaN(totalCounter)) {
          continue;
        }
        
        if (IGNORE_NAMES.includes(name)) continue;

        const getVal = (idx) => {
          const val = parseInt(String(cols[idx]).replace(/,/g, ''), 10);
          return isNaN(val) ? 0 : val;
        };

        let copy = 0, print = 0, color = 0, black = 0;

        if (cols.length >= 50) {
          // 🖨️ เครื่องสี (Color Machine) เช่น C258, C360i
          copy = getVal(22);
          print = getVal(36);
          color = getVal(48);
          black = getVal(49);
        } else {
          // 🖨️ เครื่องขาวดำ (Mono Machine) เช่น 950i
          copy = getVal(22);
          print = getVal(25);
          color = 0;
          black = copy + print; // เครื่องขาวดำ พิมพ์ทุกอย่างถือเป็นขาวดำหมด
        }

        data.push({ 
          name, 
          copy, 
          print, 
          color, 
          black 
        });
      }
    }
    return data;
  };

  const calculateData = async () => {
    try {
      setError('');
      let prevAll = [], currAll = [];
      for (const f of prevFiles) if (f) prevAll = prevAll.concat(await parseFile(f));
      for (const f of currFiles) if (f) currAll = currAll.concat(await parseFile(f));

      const prevMap = {};
      prevAll.forEach(d => {
        if (!prevMap[d.name]) prevMap[d.name] = { copy: 0, print: 0, color: 0, black: 0 };
        prevMap[d.name].copy += d.copy; prevMap[d.name].print += d.print;
        prevMap[d.name].color += d.color; prevMap[d.name].black += d.black;
      });

      const currMap = {};
      currAll.forEach(d => {
        if (!currMap[d.name]) currMap[d.name] = { copy: 0, print: 0, color: 0, black: 0 };
        currMap[d.name].copy += d.copy; currMap[d.name].print += d.print;
        currMap[d.name].color += d.color; currMap[d.name].black += d.black;
      });

      const parsedPrev = Object.keys(prevMap).map(name => ({ name, ...prevMap[name], total: prevMap[name].copy + prevMap[name].print }));
      const parsedCurr = Object.keys(currMap).map(name => ({ name, ...currMap[name], total: currMap[name].copy + currMap[name].print }));
      setRawPrevData(parsedPrev);
      setRawCurrData(parsedCurr);

      const finalData = [];
      Object.keys(currMap).forEach(name => {
        const curr = currMap[name];
        // หากไม่มีข้อมูลเดือนก่อนหน้า (เช่น พนักงานใหม่ หรือ เครื่องใหม่) จะตีค่าเป็น 0
        const prev = prevMap[name] || { copy: 0, print: 0, color: 0, black: 0 };
        const calc = (c, p) => (c >= p ? c - p : c); 
        const copy = calc(curr.copy, prev.copy), print = calc(curr.print, prev.print);
        finalData.push({ name, copy, print, color: calc(curr.color, prev.color), black: calc(curr.black, prev.black), total: copy + print });
      });

      setTableData(finalData);
      setActiveTab('summary');
    } catch (err) { setError('เกิดข้อผิดพลาดในการอ่านไฟล์ กรุณาตรวจสอบรูปแบบไฟล์อีกครั้ง'); }
  };

  const saveToHistory = () => {
    if (tableData.length === 0) { alert('กรุณาอัพโหลดไฟล์และคำนวณข้อมูลก่อนบันทึก'); return; }
    const totals = tableData.reduce((acc, row) => ({
      copy: acc.copy + row.copy, print: acc.print + row.print,
      color: acc.color + row.color, black: acc.black + row.black, total: acc.total + row.total
    }), { copy: 0, print: 0, color: 0, black: 0, total: 0 });

    const usersData = tableData.map(r => ({ ...r }));

    const monthStr = `${MONTHS[selMonthIdx]}-${selYear}`;
    const newEntry = { month: monthStr, ...totals, users: usersData };
    
    const existingIdx = historyData.findIndex(h => h.month === monthStr);
    let newHistory;
    if(existingIdx >= 0) {
        newHistory = [...historyData];
        newHistory[existingIdx] = newEntry;
    } else {
        newHistory = [...historyData, newEntry];
    }
    
    setHistoryData(newHistory);
    localStorage.setItem('konica_history', JSON.stringify(newHistory));
    alert('บันทึกประวัติสำเร็จ!');
  };

  const clearHistory = () => {
    if (window.confirm('คุณต้องการล้างประวัติกราฟทั้งหมดใช่หรือไม่?')) {
      setHistoryData([]);
      localStorage.removeItem('konica_history');
    }
  };

  const exportExcel = () => {
    let tableStr = '<tr><th>Name</th><th>Department</th><th>Copy</th><th>Print</th><th>Color</th><th>Black</th><th>Total</th></tr>';
    sortedData.forEach(r => {
      const dept = DEPARTMENT_MAP[r.name] || 'Others';
      tableStr += `<tr><td>${r.name}</td><td>${dept}</td><td>${r.copy}</td><td>${r.print}</td><td>${r.color}</td><td>${r.black}</td><td>${r.total}</td></tr>`;
    });
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table>${tableStr}</table></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'application/vnd.ms-excel' }));
    const a = document.createElement('a'); a.href = url; a.download = `konica_report_${activeTab}.xls`; a.click();
  };

  const handleSaveImage = async () => {
    try {
      setIsSavingImg(true);
      if (!window.html2canvas) {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        document.body.appendChild(script);
        await new Promise((resolve) => { script.onload = resolve; });
      }
      
      const element = document.getElementById('chart-container');
      const scrollArea = element.querySelector('.overflow-x-auto');

      // เก็บค่า Style เดิมไว้ก่อน
      const originalOverflow = scrollArea ? scrollArea.style.overflow : '';
      const originalWidth = element.style.width;

      // ปรับ Style ชั่วคราวเพื่อให้กางออกเต็มความกว้างของกราฟ
      if (scrollArea) {
        scrollArea.style.overflow = 'visible';
        element.style.width = `${Math.max(scrollArea.scrollWidth, element.clientWidth)}px`;
      }

      // รอให้เบราว์เซอร์อัปเดต DOM สักครู่
      await new Promise(resolve => setTimeout(resolve, 150));

      const canvas = await window.html2canvas(element, { 
        scale: 2, 
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth // แจ้งขนาดความกว้างที่แท้จริงให้ระบบเซฟภาพทราบ
      });

      // คืนค่า Style เดิมกลับมาทันที
      if (scrollArea) {
        scrollArea.style.overflow = originalOverflow;
        element.style.width = originalWidth;
      }

      const link = document.createElement('a');
      link.download = `konica_chart_${chartView}_${selectedDept}_${selYear}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการเซฟรูปภาพ');
    } finally {
      setIsSavingImg(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
    setSortConfig({ key, direction });
  };

  let currentDisplayData = tableData;
  if (activeTab === 'curr') currentDisplayData = rawCurrData;
  if (activeTab === 'prev') currentDisplayData = rawPrevData;

  const sortedData = useMemo(() => {
    let sortable = [...currentDisplayData];
    sortable.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortable;
  }, [currentDisplayData, sortConfig]);

  const displaySummary = currentDisplayData.reduce((acc, curr) => ({
    copy: acc.copy + curr.copy, print: acc.print + curr.print,
    color: acc.color + curr.color, black: acc.black + curr.black, total: acc.total + curr.total,
  }), { copy: 0, print: 0, color: 0, black: 0, total: 0 });

  const getTabTitle = () => {
    if (activeTab === 'summary') return 'ตารางสรุปรายบุคคล (สรุปยอดลบกันแล้ว)';
    if (activeTab === 'curr') return 'ข้อมูลที่อ่านได้ดิบ: เดือนปัจจุบัน';
    return 'ข้อมูลที่อ่านได้ดิบ: เดือนก่อนหน้า';
  };

  // -------------------------------------------------------------
  // กราฟภาพรวม (Overall Chart)
  // -------------------------------------------------------------
  const maxDataVal = historyData.length > 0 ? Math.max(...historyData.map(d => Math.max(d.total, d.copy, d.print, d.color, d.black))) : 40000;
  const yStep = Math.ceil(maxDataVal / 10 / 1000) * 1000 || 4000;
  const yMax = yStep * 10;
  const yTicks = Array.from({length: 11}, (_, i) => i * yStep).reverse();
  const yMaxLine = yMax * 2;

  // -------------------------------------------------------------
  // กราฟรายบุคคล (Individual Chart)
  // -------------------------------------------------------------
  const individualHistory = historyData.filter(h => h.users && h.users.length > 0);
  
  // รวบรวมรายชื่อและยอดตามแผนกที่เลือก
  const allUsersInDeptMap = {};
  individualHistory.forEach(h => {
    h.users.forEach(u => {
      if (HIDE_USERS.includes(u.name)) return; // 🛑 ซ่อนคนที่ถูกกำหนดไม่ให้โชว์

      const dept = DEPARTMENT_MAP[u.name] || 'Others';
      if (selectedDept === 'All' || selectedDept === dept) {
        allUsersInDeptMap[u.name] = (allUsersInDeptMap[u.name] || 0) + u.total;
      }
    });
  });
  
  const displayUsers = Object.keys(allUsersInDeptMap).sort((a,b) => allUsersInDeptMap[b] - allUsersInDeptMap[a]);
  
  // หาค่าสูงสุดสำหรับกราฟบุคคล
  let maxIndvVal = 100;
  individualHistory.forEach(h => {
    h.users.forEach(u => {
      if (displayUsers.includes(u.name)) {
        if (u.total > maxIndvVal) maxIndvVal = u.total;
      }
    });
  });
  const yStepIndv = Math.ceil(maxIndvVal / 5 / 100) * 100 || 500;
  const yMaxIndv = yStepIndv * 5;
  const yTicksIndv = Array.from({length: 6}, (_, i) => i * yStepIndv).reverse();

  // ปรับขยายความกว้างและขนาดเพื่อให้ตัวอักษรไม่โดนบีบ
  const userGroupWidth = Math.max(historyData.length * 45, 160); // 👈 เพิ่มความกว้างต่อบุคคลเป็นอย่างน้อย 160px
  const indvChartWidth = Math.max(900, displayUsers.length * userGroupWidth);

  const getShortThMonth = (enMonthStr) => {
    const [mStr] = enMonthStr.split('-');
    const idx = MONTHS.indexOf(mStr);
    const thShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return idx >= 0 ? thShort[idx] : mStr;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-[1300px] mx-auto space-y-6">
        
        {/* --- GRAPH SECTION --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
          
          <div className="p-4 px-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-center gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <BarChart3 className="text-blue-500 mt-1" size={24} />
                <div>
                  <h2 className="text-lg font-bold text-gray-800">รายงานการใช้เครื่อง KONICA (สำเนา, ปริ้น)</h2>
                  <p className="text-sm text-gray-500">ประวัติการใช้งานจะถูกเซฟเก็บไว้ในเบราว์เซอร์ของคุณ</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setChartView('overall')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${chartView === 'overall' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <PieChart size={16} /> ภาพรวมทั้งหมด
                </button>
                <button 
                  onClick={() => setChartView('individual')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${chartView === 'individual' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <Users size={16} /> รายบุคคล (แยกแผนก)
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-2 bg-gray-50 p-2 px-4 rounded-lg border border-gray-200" data-html2canvas-ignore>
              <span className="text-sm text-gray-600 font-medium">บันทึกยอดเดือนนี้:</span>
              <select className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white outline-none" value={selMonthIdx} onChange={e => setSelMonthIdx(e.target.value)}>
                {TH_MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white outline-none" value={selYear} onChange={e => setSelYear(e.target.value)}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <button onClick={saveToHistory} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm font-medium transition-colors ml-1">
                <Save size={16} /> บันทึก
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button onClick={handleSaveImage} disabled={isSavingImg} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm font-medium transition-colors">
                <ImageIcon size={16} /> {isSavingImg ? 'กำลังโหลด...' : 'เซฟเป็นภาพ'}
              </button>
              <button onClick={clearHistory} className="text-red-500 hover:text-red-700 text-sm font-medium ml-2">
                ล้างกราฟ
              </button>
            </div>
          </div>

          <div id="chart-container" className="bg-white">
            
            {/* --- ภาพรวม --- */}
            {chartView === 'overall' && (
              <div className="p-6 overflow-x-auto custom-scrollbar pb-20"> {/* 👈 เพิ่ม Bottom padding สำหรับ Scroll */}
                <h3 className="text-center font-bold text-gray-700 mb-6 text-lg" data-html2canvas-show>
                  กราฟภาพรวมการใช้งานทุกเครื่อง (ยอดรวมทั้งหมด)
                </h3>
                
                {/* 👈 ซิงค์ความสูง h-[400px] เป๊ะๆ เพื่อไม่ให้เส้นกริดคลาดเคลื่อน */}
                <div className="min-w-[800px] flex relative mt-4 mb-20">
                  <div className="w-16 flex flex-col justify-between items-end pr-3 text-[11px] font-semibold text-gray-500 bg-white sticky left-0 z-20 h-[400px]">
                    {yTicks.map(tick => <span key={`l-${tick}`}>{tick.toLocaleString()}</span>)}
                  </div>
                  
                  <div className="flex-1 relative border-l border-r border-b border-gray-300 h-[400px]">
                    {yTicks.map((_, i) => (
                      <div key={i} className="absolute w-full border-t border-dashed border-gray-200" style={{ top: `${(i / 10) * 100}%` }}></div>
                    ))}
                    
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" style={{ zIndex: 10 }}>
                      {historyData.map((d, i) => {
                        if (i === 0) return null;
                        const x1 = `${((i - 1) + 0.5) * (100 / historyData.length)}%`;
                        const y1 = `${100 - (historyData[i-1].total / yMaxLine * 100)}%`;
                        const x2 = `${(i + 0.5) * (100 / historyData.length)}%`;
                        const y2 = `${100 - (d.total / yMaxLine * 100)}%`;
                        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,4" />
                      })}
                    </svg>

                    <div className="absolute inset-0 flex">
                      {historyData.map((d, i) => {
                        const hTotalLine = (d.total / yMaxLine) * 100;
                        const diff = i > 0 ? d.total - historyData[i-1].total : 0;
                        const diffPercent = i > 0 && historyData[i-1].total > 0 ? (diff / historyData[i-1].total) * 100 : 0;
                        
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                            <div className="w-full max-w-[120px] flex items-end justify-center gap-1.5 h-full z-0 px-2">
                              <div className="flex-1 rounded-t-sm relative flex justify-center" style={{ backgroundColor: COLORS.copy, height: `${(d.copy/yMax)*100}%`, minHeight: d.copy > 0?'2px':'0' }}>
                                {d.copy > 0 && <span className="absolute -top-10 text-[11px] font-bold text-gray-700 -rotate-90 whitespace-nowrap">{d.copy.toLocaleString()}</span>}
                              </div>
                              <div className="flex-1 rounded-t-sm relative flex justify-center" style={{ backgroundColor: COLORS.print, height: `${(d.print/yMax)*100}%`, minHeight: d.print > 0?'2px':'0' }}>
                                {d.print > 0 && <span className="absolute -top-12 text-[11px] font-bold text-gray-700 -rotate-90 whitespace-nowrap">{d.print.toLocaleString()}</span>}
                              </div>
                              <div className="flex-1 rounded-t-sm relative flex justify-center" style={{ backgroundColor: COLORS.color, height: `${(d.color/yMax)*100}%`, minHeight: d.color > 0?'2px':'0' }}>
                                {d.color > 0 && <span className="absolute -top-10 text-[11px] font-bold text-gray-700 -rotate-90 whitespace-nowrap">{d.color.toLocaleString()}</span>}
                              </div>
                              <div className="flex-1 rounded-t-sm relative flex justify-center" style={{ backgroundColor: COLORS.black, height: `${(d.black/yMax)*100}%`, minHeight: d.black > 0?'2px':'0' }}>
                                {d.black > 0 && <span className="absolute -top-12 text-[11px] font-bold text-gray-700 -rotate-90 whitespace-nowrap">{d.black.toLocaleString()}</span>}
                              </div>
                            </div>

                            <div className="absolute w-full flex flex-col items-center" style={{ bottom: `${hTotalLine}%`, zIndex: 20 }}>
                              <div className="bg-[#f59e0b] text-white text-xs font-bold px-2.5 py-1 rounded shadow-md relative -top-6 whitespace-nowrap border border-white">
                                {d.total.toLocaleString()}
                              </div>
                              {i > 0 && (
                                <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded border mt-[-20px] bg-white whitespace-nowrap shadow-sm ${diff >= 0 ? 'text-[#059669] border-emerald-200' : 'text-[#dc2626] border-red-200'}`}>
                                  {diff >= 0 ? '▲ +' : '▼ '}{Math.abs(diffPercent).toFixed(2)} %
                                </div>
                              )}
                              <div className="w-3.5 h-3.5 bg-white border-2 border-[#f59e0b] rounded-full absolute -bottom-1.5 shadow-sm"></div>
                            </div>
                            
                            {/* 👈 ระยะห่างเดือนให้อยู่ในระยะพอดี ไม่ตัดขาด */}
                            <div className="absolute -bottom-8 text-sm font-bold text-gray-800 w-full text-center">{d.month}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="w-16 flex flex-col justify-between items-start pl-3 text-[11px] font-semibold text-amber-600 bg-white sticky right-0 z-20 h-[400px]">
                    {yTicks.map(tick => <span key={`r-${tick}`}>{(tick * 2).toLocaleString()}</span>)}
                  </div>
                </div>
              </div>
            )}

            {/* --- รายบุคคลแบบ Stack รวม --- */}
            {chartView === 'individual' && (
              <div className="p-6 pb-2">
                
                <div className="flex flex-col items-center mb-6" data-html2canvas-show>
                  <h3 className="font-bold text-gray-700 text-lg mb-4">
                    รายงานการใช้เครื่อง KONICA แบบรายบุคคล | {selectedDept !== 'All' ? `แผนก ${selectedDept}` : 'ทุกแผนก'} | ประจำปี {selYear}
                  </h3>
                  
                  {/* แท็บเลือกแผนก */}
                  <div className="flex flex-wrap justify-center gap-2 max-w-4xl" data-html2canvas-ignore>
                    {DEPARTMENTS.map(dept => (
                      <button
                        key={dept}
                        onClick={() => setSelectedDept(dept)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${selectedDept === dept ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>

                {displayUsers.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-gray-400 font-medium border-2 border-dashed border-gray-200 rounded-lg">
                    ไม่พบข้อมูลพนักงานในแผนกนี้ หรือคุณยังไม่ได้บันทึกข้อมูลลงกราฟ
                  </div>
                ) : (
                  <div className="overflow-x-auto custom-scrollbar pb-14"> {/* 👈 เพิ่มพื้นที่ให้เลื่อนได้โดยตัวหนังสือไม่หาย */}
                    <div className="flex relative mt-4 mb-24" style={{ minWidth: `${indvChartWidth}px` }}> {/* 👈 เพิ่ม mb-24 ให้ฐานชื่อคนไม่หลุดขอบ */}
                      
                      <div className="w-14 flex flex-col justify-between items-end pr-3 text-[11px] font-semibold text-gray-500 bg-white sticky left-0 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-gray-200 h-[400px]">
                        {yTicksIndv.map(tick => <span key={`li-${tick}`}>{tick.toLocaleString()}</span>)}
                      </div>

                      <div className="flex-1 relative border-b border-gray-300 ml-2 h-[400px]">
                        {yTicksIndv.map((_, i) => (
                          <div key={i} className="absolute w-full border-t border-dashed border-gray-200" style={{ top: `${(i / 5) * 100}%` }}></div>
                        ))}

                        <div className="absolute inset-0 flex">
                          {displayUsers.map((userName, uIdx) => {
                            return (
                              <div key={uIdx} className="relative flex flex-col items-center justify-end h-full" style={{ width: `${userGroupWidth}px` }}>
                                
                                {uIdx > 0 && <div className="absolute left-0 top-0 h-full border-l border-gray-200"></div>}
                                
                                <div className="w-full h-full flex items-end justify-center gap-1.5 px-3">
                                  {individualHistory.map((h, mIdx) => {
                                    const uData = h.users.find(u => u.name === userName) || {total:0, copy:0, print:0, color:0, black:0};
                                    
                                    const hTotal = yMaxIndv > 0 ? (uData.total / yMaxIndv) * 100 : 0;
                                    const hCopy = uData.total > 0 ? (uData.copy / uData.total) * 100 : 0;
                                    const hPrint = uData.total > 0 ? (uData.print / uData.total) * 100 : 0;
                                    const hColor = uData.total > 0 ? (uData.color / uData.total) * 100 : 0;
                                    const hBlack = uData.total > 0 ? (uData.black / uData.total) * 100 : 0;

                                    // 👈 คำนวณความสูงจริงเทียบกับกราฟทั้งหมด เพื่อซ่อนตัวเลขเวลากราฟเตี้ยเกินไป (เตี้ยกว่า 14px)
                                    const copyHeightPx = (uData.copy / yMaxIndv) * 400; 
                                    const printHeightPx = (uData.print / yMaxIndv) * 400;
                                    const colorHeightPx = (uData.color / yMaxIndv) * 400;
                                    const blackHeightPx = (uData.black / yMaxIndv) * 400;

                                    return (
                                      <div key={mIdx} className="flex-1 flex flex-col justify-end items-center h-full relative group min-w-[25px] max-w-[40px]">
                                        
                                        {uData.total > 0 && (
                                          <div className="w-full flex flex-col justify-end items-center relative z-10 hover:opacity-90 transition-opacity" style={{ height: `${hTotal}%` }}>
                                            
                                            {/* Stack: Black, Color, Print, Copy (ล่างสุด) */}
                                            {uData.black > 0 && (
                                              <div className="w-full relative flex flex-col items-center justify-center border-b border-white/20" style={{ height: `${hBlack}%`, backgroundColor: COLORS.black }}>
                                                {blackHeightPx > 14 && <span className="text-[9px] font-bold text-white px-1 leading-none">{uData.black}</span>}
                                              </div>
                                            )}
                                            {uData.color > 0 && (
                                              <div className="w-full relative flex flex-col items-center justify-center border-b border-white/20" style={{ height: `${hColor}%`, backgroundColor: COLORS.color }}>
                                                {colorHeightPx > 14 && <span className="text-[9px] font-bold text-white px-1 leading-none">{uData.color}</span>}
                                              </div>
                                            )}
                                            {uData.print > 0 && (
                                              <div className="w-full relative flex flex-col items-center justify-center border-b border-white/20" style={{ height: `${hPrint}%`, backgroundColor: COLORS.print }}>
                                                {printHeightPx > 14 && <span className="text-[9px] font-bold text-gray-800 px-1 leading-none">{uData.print}</span>}
                                              </div>
                                            )}
                                            {uData.copy > 0 && (
                                              <div className="w-full relative flex flex-col items-center justify-center" style={{ height: `${hCopy}%`, backgroundColor: COLORS.copy }}>
                                                {copyHeightPx > 14 && <span className="text-[9px] font-bold text-gray-800 px-1 leading-none">{uData.copy}</span>}
                                              </div>
                                            )}
                                            
                                            <div className="absolute -top-5 text-[10px] font-bold text-gray-700 bg-white/90 px-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                              รวม: {uData.total.toLocaleString()}
                                            </div>
                                          </div>
                                        )}

                                        {/* 👈 ลบ truncate ทิ้ง เพื่อไม่ให้ชื่อเดือนหายไป */}
                                        <div className="absolute -bottom-6 text-[10px] font-semibold text-gray-500 w-full text-center">
                                          {getShortThMonth(h.month)}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>

                                {/* 👈 ลบ truncate ออกเช่นกัน และปรับตำแหน่งให้ชัดเจนขึ้น */}
                                <div className="absolute -bottom-14 text-sm font-bold text-gray-700 w-full text-center pt-2 px-2">
                                  {userName}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-wrap justify-center mt-6 pb-6 gap-6 text-sm text-gray-600 font-bold border-t border-gray-100 pt-4">
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm shadow-sm" style={{ backgroundColor: COLORS.copy }}></span> Copy</span>
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm shadow-sm" style={{ backgroundColor: COLORS.print }}></span> Printer</span>
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm shadow-sm" style={{ backgroundColor: COLORS.color }}></span> Color</span>
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm shadow-sm" style={{ backgroundColor: COLORS.black }}></span> Black</span>
            </div>
            
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2"><AlertCircle size={20} />{error}</div>}

        {/* --- UPLOAD SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
            <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="bg-gray-100 p-1.5 rounded text-gray-600"><Upload size={18} /></span> ไฟล์เดือน "ก่อนหน้า"
            </h2>
            <div className="space-y-3">
              {[1, 2, 3].map((num, i) => (
                <div key={`prev-${i}`} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 w-16">เครื่อง {num}</span>
                  {!prevFiles[i] ? (
                    <input type="file" accept=".csv, .txt" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer" onChange={(e) => handleFileChange(i, 'prev', e.target.files[0])} />
                  ) : (
                    <div className="flex-1 flex items-center justify-between bg-green-50 text-green-700 px-3 py-1.5 rounded text-sm border border-green-100 shadow-sm"><span className="truncate max-w-[200px]">{prevFiles[i].name}</span><button onClick={() => removeFile(i, 'prev')} className="text-red-500 hover:text-red-700 bg-red-50 p-1 rounded"><Trash2 size={16} /></button></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-200 hover:border-blue-300 transition-colors">
            <h2 className="font-semibold text-blue-700 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 p-1.5 rounded text-blue-600"><Upload size={18} /></span> ไฟล์เดือน "ปัจจุบัน"
            </h2>
            <div className="space-y-3">
              {[1, 2, 3].map((num, i) => (
                <div key={`curr-${i}`} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-500 w-16">เครื่อง {num}</span>
                  {!currFiles[i] ? (
                    <input type="file" accept=".csv, .txt" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" onChange={(e) => handleFileChange(i, 'curr', e.target.files[0])} />
                  ) : (
                    <div className="flex-1 flex items-center justify-between bg-green-50 text-green-700 px-3 py-1.5 rounded text-sm border border-green-100 shadow-sm"><span className="truncate max-w-[200px]">{currFiles[i].name}</span><button onClick={() => removeFile(i, 'curr')} className="text-red-500 hover:text-red-700 bg-red-50 p-1 rounded"><Trash2 size={16} /></button></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center py-4">
          <button onClick={calculateData} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-12 rounded-full shadow-lg transition-transform active:scale-95 text-lg flex items-center gap-2">
            <Calculator size={20} /> คำนวณยอดการใช้งาน
          </button>
        </div>

        {/* --- RESULTS TABLE --- */}
        {(tableData.length > 0 || rawCurrData.length > 0) && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex flex-wrap gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 shadow-sm">
              <button onClick={() => setActiveTab('summary')} className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'summary' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}>
                <Calculator size={18} /> สรุปยอด (ลบกันแล้ว)
              </button>
              <button onClick={() => setActiveTab('curr')} className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'curr' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}>
                <Search size={18} /> ข้อมูลที่อ่านได้: เดือนปัจจุบัน
              </button>
              <button onClick={() => setActiveTab('prev')} className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'prev' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}>
                <Search size={18} /> ข้อมูลที่อ่านได้: เดือนก่อนหน้า
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-700">{getTabTitle()} <span className="text-blue-600 ml-2 bg-blue-100 px-2 py-0.5 rounded text-xs">ยอดรวม: {displaySummary.total.toLocaleString()} แผ่น</span></h3>
                <button onClick={exportExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                  <FileDown size={16} /> ส่งออก Excel
                </button>
              </div>
              <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-gray-100 shadow-sm z-10">
                    <tr className="text-gray-600 text-sm">
                      <th className="p-3 cursor-pointer hover:bg-gray-200" onClick={() => handleSort('name')}>ชื่อ (Name) {sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}</th>
                      <th className="p-3 cursor-pointer hover:bg-gray-200">แผนก (Dept)</th>
                      <th className="p-3 text-right cursor-pointer hover:bg-gray-200" onClick={() => handleSort('copy')}>Copy {sortConfig?.key === 'copy' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}</th>
                      <th className="p-3 text-right cursor-pointer hover:bg-gray-200" onClick={() => handleSort('print')}>Print {sortConfig?.key === 'print' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}</th>
                      <th className="p-3 text-right cursor-pointer hover:bg-gray-200" onClick={() => handleSort('color')}>Color {sortConfig?.key === 'color' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}</th>
                      <th className="p-3 text-right cursor-pointer hover:bg-gray-200" onClick={() => handleSort('black')}>Black {sortConfig?.key === 'black' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}</th>
                      <th className="p-3 text-right cursor-pointer hover:bg-gray-200 bg-blue-50 text-blue-700" onClick={() => handleSort('total')}>รวมทั้งหมด {sortConfig?.key === 'total' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortedData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-medium text-gray-800">{row.name}</td>
                        <td className="p-3 text-xs text-gray-500">{DEPARTMENT_MAP[row.name] || '-'}</td>
                        <td className="p-3 text-right text-gray-600">{row.copy.toLocaleString()}</td>
                        <td className="p-3 text-right text-gray-600">{row.print.toLocaleString()}</td>
                        <td className="p-3 text-right text-purple-600">{row.color.toLocaleString()}</td>
                        <td className="p-3 text-right text-gray-600">{row.black.toLocaleString()}</td>
                        <td className="p-3 text-right font-bold text-blue-600 bg-blue-50/30">{row.total.toLocaleString()}</td>
                      </tr>
                    ))}
                    {sortedData.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center p-8 text-gray-400">ไม่พบข้อมูล หรือคุณยังไม่ได้อัปโหลดไฟล์ในเดือนนี้</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}
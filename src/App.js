import React, { useState, useEffect, useMemo } from 'react';
import { Upload, FileDown, Trash2, BarChart3, AlertCircle, Save, Image as ImageIcon, Calculator, Search, Users, PieChart } from 'lucide-react';

const IGNORE_NAMES = ['konica', 'boxadmin', 'konica360', 'public'];

// 🏢 ฐานข้อมูลแผนก (อ้างอิงจาก PDF)
const DEFAULT_DEPARTMENT_MAP = {
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

const createSampleUsers = (monthIndex) => {
  const baseUsers = [
    { name: 'rattana', copy: 35, print: 220, color: 0, black: 255 },
    { name: 'srirat', copy: 28, print: 180, color: 0, black: 208 },
    { name: 'worakeat', copy: 18, print: 145, color: 16, black: 147 },
    { name: 'suwat', copy: 12, print: 110, color: 9, black: 113 },
    { name: 'somying', copy: 22, print: 190, color: 4, black: 208 },
    { name: 'lawan', copy: 16, print: 95, color: 3, black: 108 },
    { name: 'panuwat', copy: 25, print: 155, color: 5, black: 175 },
    { name: 'amarin', copy: 30, print: 210, color: 0, black: 240 },
    { name: 'chanistha', copy: 20, print: 125, color: 7, black: 138 },
    { name: 'suparat', copy: 24, print: 135, color: 6, black: 153 },
    { name: 'pitak', copy: 17, print: 105, color: 2, black: 120 },
    { name: 'monkawee', copy: 14, print: 90, color: 1, black: 103 }
  ];

  return baseUsers.map((user, index) => {
    const factor = 1 + (monthIndex * 0.12) + ((index % 3) * 0.04);
    const copy = Math.round(user.copy * factor);
    const print = Math.round(user.print * factor);
    const color = Math.round(user.color * factor);
    const black = Math.round(user.black * factor);
    return { name: user.name, copy, print, color, black, total: copy + print };
  });
};

// ข้อมูลจำลองเพื่อให้กราฟแสดงทันที
const DUMMY_HISTORY = [
  { month: 'Jan-2026', copy: 1146, print: 28475, color: 173, black: 29448, total: 29621, users: createSampleUsers(0) },
  { month: 'Feb-2026', copy: 2389, print: 26591, color: 240, black: 28740, total: 28980, users: createSampleUsers(1) },
  { month: 'Mar-2026', copy: 3152, print: 34827, color: 2163, black: 35810, total: 37979, users: createSampleUsers(2) },
  { month: 'Apr-2026', copy: 1658, print: 21043, color: 124, black: 22577, total: 22701, users: createSampleUsers(3) },
  { month: 'May-2026', copy: 832, print: 25933, color: 243, black: 26522, total: 26765, users: createSampleUsers(4) },
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
  const [counterHistory, setCounterHistory] = useState({});
  const [departmentMap, setDepartmentMap] = useState(DEFAULT_DEPARTMENT_MAP);
  const [hiddenUsers, setHiddenUsers] = useState([]);
  
  const [chartView, setChartView] = useState('overall'); // 'overall', 'individual'
  const [selectedDept, setSelectedDept] = useState('All'); // แผนกที่เลือกดู
  
  const [selMonthIdx, setSelMonthIdx] = useState(new Date().getMonth());
  const [selYear, setSelYear] = useState(new Date().getFullYear().toString());
  
  const [sortConfig, setSortConfig] = useState({ key: 'total', direction: 'desc' });
  const [error, setError] = useState('');
  const [isSavingImg, setIsSavingImg] = useState(false);
  const [toast, setToast] = useState('');
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [manageUserName, setManageUserName] = useState('');
  const [manageDept, setManageDept] = useState('IT');
  const [customDept, setCustomDept] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('konica_history');
    const savedCounters = localStorage.getItem('konica_counter_history');
    const savedDepartments = localStorage.getItem('konica_department_map');
    const savedHiddenUsers = localStorage.getItem('konica_hidden_users');

    if (saved && JSON.parse(saved).length > 0) {
      const parsedHistory = JSON.parse(saved);
      const legacyPurchasingUsers = ['rattana', 'srirat', 'benjawan', 'apichaya'];
      const hasOnlyLegacySampleUsers = parsedHistory.every(item =>
        item.users?.length > 0 && item.users.every(user => legacyPurchasingUsers.includes(user.name))
      );
      setHistoryData(hasOnlyLegacySampleUsers ? DUMMY_HISTORY : parsedHistory);
    } else {
      setHistoryData(DUMMY_HISTORY);
    }

    if (savedCounters) {
      setCounterHistory(JSON.parse(savedCounters));
    }

    if (savedDepartments) {
      setDepartmentMap({ ...DEFAULT_DEPARTMENT_MAP, ...JSON.parse(savedDepartments) });
    }

    if (savedHiddenUsers) {
      setHiddenUsers(JSON.parse(savedHiddenUsers));
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

  const aggregateUsage = (rows) => {
    const map = {};
    rows.forEach(d => {
      if (!map[d.name]) map[d.name] = { copy: 0, print: 0, color: 0, black: 0 };
      map[d.name].copy += d.copy;
      map[d.name].print += d.print;
      map[d.name].color += d.color;
      map[d.name].black += d.black;
    });
    return map;
  };

  const rowsFromUsageMap = (map) => Object.keys(map).map(name => ({
    name,
    ...map[name],
    total: map[name].copy + map[name].print
  }));

  const getMonthKey = (monthIdx = selMonthIdx, year = selYear) => `${MONTHS[Number(monthIdx)]}-${year}`;

  const getPreviousMonthKey = () => {
    const currentMonth = Number(selMonthIdx);
    const currentYear = Number(selYear);
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return `${MONTHS[prevMonth]}-${prevYear}`;
  };

  const calculateData = async () => {
    try {
      setError('');
      let prevAll = [], currAll = [];
      for (const f of prevFiles) if (f) prevAll = prevAll.concat(await parseFile(f));
      for (const f of currFiles) if (f) currAll = currAll.concat(await parseFile(f));

      if (currAll.length === 0) {
        setError('กรุณาอัปโหลดไฟล์เดือนปัจจุบันก่อนคำนวณ');
        return;
      }

      const prevKey = getPreviousMonthKey();
      const prevFromBackup = prevAll.length === 0 ? (counterHistory[prevKey] || []) : [];
      const effectivePrevAll = prevAll.length > 0 ? prevAll : prevFromBackup;

      if (prevAll.length === 0 && prevFromBackup.length > 0) {
        showToast(`ใช้ข้อมูลเดือนก่อนหน้า ${prevKey} จากระบบอัตโนมัติ`);
      } else if (prevAll.length === 0) {
        showToast(`ยังไม่มี baseline เดือนก่อนหน้า ${prevKey} ระบบจะคิดเดือนก่อนเป็น 0`);
      }

      const prevMap = aggregateUsage(effectivePrevAll);
      const currMap = aggregateUsage(currAll);

      const parsedPrev = rowsFromUsageMap(prevMap);
      const parsedCurr = rowsFromUsageMap(currMap);
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

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3000);
  };

  const saveToHistory = () => {
    if (tableData.length === 0) { showToast('กรุณาอัพโหลดไฟล์และคำนวณข้อมูลก่อนบันทึก'); return; }
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
    if (rawCurrData.length > 0) {
      const nextCounterHistory = { ...counterHistory, [monthStr]: rawCurrData };
      setCounterHistory(nextCounterHistory);
      localStorage.setItem('konica_counter_history', JSON.stringify(nextCounterHistory));
    }
    showToast('บันทึกประวัติสำเร็จ');
  };

  const clearHistory = () => {
    setHistoryData([]);
    setCounterHistory({});
    localStorage.removeItem('konica_history');
    localStorage.removeItem('konica_counter_history');
    setIsConfirmingClear(false);
    showToast('ล้างประวัติกราฟแล้ว');
  };

  const exportExcel = () => {
    let tableStr = '<tr><th>Name</th><th>Department</th><th>Copy</th><th>Print</th><th>Color</th><th>Black</th><th>Total</th></tr>';
    sortedData.forEach(r => {
      const dept = departmentMap[r.name] || 'Others';
      tableStr += `<tr><td>${r.name}</td><td>${dept}</td><td>${r.copy}</td><td>${r.print}</td><td>${r.color}</td><td>${r.black}</td><td>${r.total}</td></tr>`;
    });
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table>${tableStr}</table></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'application/vnd.ms-excel' }));
    const a = document.createElement('a'); a.href = url; a.download = `konica_report_${activeTab}.xls`; a.click();
  };

  const exportHistoryBackup = () => {
    const payload = {
      app: 'konica-printer-summary',
      version: 1,
      exportedAt: new Date().toISOString(),
      historyData,
      counterHistory,
      departmentMap,
      hiddenUsers
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `konica_history_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('ดาวน์โหลดไฟล์สำรองข้อมูลกราฟแล้ว');
  };

  const importHistoryBackup = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const payload = JSON.parse(await file.text());
      const nextHistory = Array.isArray(payload) ? payload : payload.historyData;
      if (!Array.isArray(nextHistory)) throw new Error('Invalid backup file');

      setHistoryData(nextHistory);
      localStorage.setItem('konica_history', JSON.stringify(nextHistory));
      if (payload.counterHistory && typeof payload.counterHistory === 'object') {
        setCounterHistory(payload.counterHistory);
        localStorage.setItem('konica_counter_history', JSON.stringify(payload.counterHistory));
      }
      if (payload.departmentMap && typeof payload.departmentMap === 'object') {
        const nextDepartmentMap = { ...DEFAULT_DEPARTMENT_MAP, ...payload.departmentMap };
        setDepartmentMap(nextDepartmentMap);
        localStorage.setItem('konica_department_map', JSON.stringify(nextDepartmentMap));
      }
      if (Array.isArray(payload.hiddenUsers)) {
        setHiddenUsers(payload.hiddenUsers);
        localStorage.setItem('konica_hidden_users', JSON.stringify(payload.hiddenUsers));
      }
      showToast('นำเข้าข้อมูลกราฟสำเร็จ');
    } catch (err) {
      showToast('ไฟล์สำรองข้อมูลไม่ถูกต้อง');
    } finally {
      event.target.value = '';
    }
  };

  const saveDepartmentMapping = () => {
    const normalizedName = manageUserName.trim().toLowerCase();
    const targetDept = customDept.trim() || manageDept;

    if (!normalizedName || !targetDept) {
      showToast('กรุณากรอกชื่อ user และแผนก');
      return;
    }

    const nextDepartmentMap = { ...departmentMap, [normalizedName]: targetDept };
    setDepartmentMap(nextDepartmentMap);
    localStorage.setItem('konica_department_map', JSON.stringify(nextDepartmentMap));
    setManageUserName('');
    setCustomDept('');
    showToast(`บันทึกแผนกของ ${normalizedName} แล้ว`);
  };

  const removeDepartmentMapping = (name) => {
    const nextDepartmentMap = { ...departmentMap };
    delete nextDepartmentMap[name];
    setDepartmentMap(nextDepartmentMap);
    localStorage.setItem('konica_department_map', JSON.stringify(nextDepartmentMap));
    showToast(`ลบแผนกของ ${name} แล้ว`);
  };

  const resetDepartmentMapping = () => {
    setDepartmentMap(DEFAULT_DEPARTMENT_MAP);
    localStorage.setItem('konica_department_map', JSON.stringify(DEFAULT_DEPARTMENT_MAP));
    showToast('รีเซ็ตแผนกกลับเป็นค่าเริ่มต้นแล้ว');
  };

  const setUserHidden = (name, shouldHide) => {
    const normalizedName = name.trim().toLowerCase();
    const nextHiddenUsers = shouldHide
      ? Array.from(new Set([...hiddenUsers, normalizedName]))
      : hiddenUsers.filter(userName => userName !== normalizedName);

    setHiddenUsers(nextHiddenUsers);
    localStorage.setItem('konica_hidden_users', JSON.stringify(nextHiddenUsers));
    showToast(shouldHide ? `ซ่อน ${normalizedName} จากกราฟรายบุคคลแล้ว` : `แสดง ${normalizedName} ในกราฟรายบุคคลแล้ว`);
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
      showToast('เกิดข้อผิดพลาดในการเซฟรูปภาพ');
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

  const getSortDirection = (key) => sortConfig.key === key ? sortConfig.direction : undefined;
  const sortIcon = (key) => sortConfig.key === key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '';
  const formatDelta = (value, percent) => `${value >= 0 ? '+' : '-'}${Math.abs(value).toLocaleString()} (${value >= 0 ? '+' : '-'}${Math.abs(percent).toFixed(2)}%)`;
  const getStackTotal = (row) => row.copy + row.print + row.color + row.black;

  const SortableHeader = ({ sortKey, children, align = 'left', highlight = false }) => {
    const direction = getSortDirection(sortKey);
    return (
      <th
        scope="col"
        aria-sort={direction ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
        className={`p-0 ${highlight ? 'bg-blue-50 text-blue-700' : ''}`}
      >
        <button
          type="button"
          onClick={() => handleSort(sortKey)}
          className={`flex w-full items-center gap-1 p-3 font-semibold hover:bg-gray-200 ${align === 'right' ? 'justify-end text-right' : 'justify-start text-left'}`}
        >
          <span>{children}</span>
          <span aria-hidden="true" className="text-xs">{sortIcon(sortKey)}</span>
        </button>
      </th>
    );
  };

  const departmentOptions = useMemo(() => {
    const values = new Set(DEPARTMENTS);
    Object.values(departmentMap).forEach(dept => values.add(dept));
    return Array.from(values);
  }, [departmentMap]);

  const managedUsers = useMemo(() => {
    const names = new Set(Object.keys(departmentMap));
    historyData.forEach(item => item.users?.forEach(user => names.add(user.name)));
    tableData.forEach(user => names.add(user.name));
    rawPrevData.forEach(user => names.add(user.name));
    rawCurrData.forEach(user => names.add(user.name));
    hiddenUsers.forEach(name => names.add(name));
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [departmentMap, historyData, tableData, rawPrevData, rawCurrData, hiddenUsers]);

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
      if (hiddenUsers.includes(u.name)) return;

      const dept = departmentMap[u.name] || 'Others';
      if (selectedDept === 'All' || selectedDept === dept) {
        allUsersInDeptMap[u.name] = (allUsersInDeptMap[u.name] || 0) + getStackTotal(u);
      }
    });
  });
  
  const displayUsers = Object.keys(allUsersInDeptMap).sort((a,b) => allUsersInDeptMap[b] - allUsersInDeptMap[a]);
  
  // หาค่าสูงสุดสำหรับกราฟบุคคล
  let maxIndvVal = 100;
  individualHistory.forEach(h => {
    h.users.forEach(u => {
      if (displayUsers.includes(u.name)) {
        const stackTotal = getStackTotal(u);
        if (stackTotal > maxIndvVal) maxIndvVal = stackTotal;
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
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-900">รายงานการใช้เครื่อง KONICA</h1>
          <p className="text-sm text-gray-500">อัปโหลดไฟล์เดือนก่อนหน้าและเดือนปัจจุบัน จากนั้นคำนวณเพื่อดูสรุปและบันทึกลงกราฟ</p>
        </header>

        {toast && (
          <div role="status" className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 shadow-sm">
            {toast}
          </div>
        )}

        {error && <div role="alert" className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2"><AlertCircle size={20} />{error}</div>}

        <section aria-labelledby="upload-heading" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h2 id="upload-heading" className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Upload className="text-blue-500" size={22} /> 1. อัปโหลดไฟล์สำหรับคำนวณ
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              เดือนนี้: <span className="font-semibold text-gray-700">{getMonthKey()}</span> | baseline อัตโนมัติเดือนก่อนหน้า: <span className="font-semibold text-gray-700">{getPreviousMonthKey()}</span>
              {counterHistory[getPreviousMonthKey()] ? ' พร้อมใช้งาน' : ' ยังไม่มีข้อมูลสำรอง'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-700 mb-4">ไฟล์เดือน "ก่อนหน้า"</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((num, i) => (
                  <div key={`prev-${i}`} className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label htmlFor={`prev-file-${i}`} className="text-sm font-medium text-gray-500 sm:w-16">เครื่อง {num}</label>
                    {!prevFiles[i] ? (
                      <input id={`prev-file-${i}`} type="file" accept=".csv, .txt" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer" onChange={(e) => handleFileChange(i, 'prev', e.target.files[0])} />
                    ) : (
                      <div className="flex-1 flex items-center justify-between bg-green-50 text-green-700 px-3 py-2 rounded text-sm border border-green-100 shadow-sm"><span className="truncate max-w-[240px]">{prevFiles[i].name}</span><button aria-label={`ลบไฟล์เดือนก่อนหน้า เครื่อง ${num}`} onClick={() => removeFile(i, 'prev')} className="text-red-500 hover:text-red-700 bg-red-50 p-1 rounded"><Trash2 size={16} /></button></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 p-4">
              <h3 className="font-semibold text-blue-700 mb-4">ไฟล์เดือน "ปัจจุบัน"</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((num, i) => (
                  <div key={`curr-${i}`} className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label htmlFor={`curr-file-${i}`} className="text-sm font-medium text-blue-500 sm:w-16">เครื่อง {num}</label>
                    {!currFiles[i] ? (
                      <input id={`curr-file-${i}`} type="file" accept=".csv, .txt" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" onChange={(e) => handleFileChange(i, 'curr', e.target.files[0])} />
                    ) : (
                      <div className="flex-1 flex items-center justify-between bg-green-50 text-green-700 px-3 py-2 rounded text-sm border border-green-100 shadow-sm"><span className="truncate max-w-[240px]">{currFiles[i].name}</span><button aria-label={`ลบไฟล์เดือนปัจจุบัน เครื่อง ${num}`} onClick={() => removeFile(i, 'curr')} className="text-red-500 hover:text-red-700 bg-red-50 p-1 rounded"><Trash2 size={16} /></button></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center border-t border-gray-100 bg-gray-50 p-5">
            <button onClick={calculateData} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-lg shadow transition-transform active:scale-95 text-base flex items-center gap-2">
              <Calculator size={20} /> คำนวณยอดการใช้งาน
            </button>
          </div>
        </section>

        <section aria-labelledby="department-heading" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h2 id="department-heading" className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Users className="text-blue-500" size={22} /> 2. จัดการรายชื่อและแผนก
            </h2>
            <p className="mt-2 text-sm text-gray-500">เพิ่มหรือแก้แผนกของ user ได้ที่นี่ และซ่อนพนักงานลาออกจากกราฟรายบุคคลได้ โดยยอดยังนับในกราฟภาพรวม</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.4fr] gap-5 p-5">
            <div className="rounded-lg border border-gray-200 p-4 space-y-3">
              <div>
                <label htmlFor="manage-user-name" className="block text-xs font-semibold text-gray-500 mb-1">User name</label>
                <input
                  id="manage-user-name"
                  type="text"
                  value={manageUserName}
                  onChange={(e) => setManageUserName(e.target.value)}
                  placeholder="เช่น worakeat"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label htmlFor="manage-dept" className="block text-xs font-semibold text-gray-500 mb-1">เลือกแผนก</label>
                <select
                  id="manage-dept"
                  value={manageDept}
                  onChange={(e) => setManageDept(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {departmentOptions.filter(dept => dept !== 'All').map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="custom-dept" className="block text-xs font-semibold text-gray-500 mb-1">หรือเพิ่มแผนกใหม่</label>
                <input
                  id="custom-dept"
                  type="text"
                  value={customDept}
                  onChange={(e) => setCustomDept(e.target.value)}
                  placeholder="ถ้าไม่ใส่ จะใช้แผนกที่เลือกด้านบน"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button onClick={saveDepartmentMapping} className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">บันทึกแผนก</button>
                <button onClick={resetDepartmentMapping} className="rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">รีเซ็ตค่าเริ่มต้น</button>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="max-h-[270px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-gray-100 text-gray-600">
                    <tr>
                      <th className="p-3 font-semibold">User</th>
                      <th className="p-3 font-semibold">แผนก</th>
                      <th className="p-3 font-semibold">สถานะกราฟรายบุคคล</th>
                      <th className="p-3 text-right font-semibold">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {managedUsers.map((name) => {
                      const dept = departmentMap[name] || 'Others';
                      const isHidden = hiddenUsers.includes(name);

                      return (
                        <tr key={name} className="hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-800">{name}</td>
                          <td className="p-3 text-gray-600">{dept}</td>
                          <td className="p-3">
                            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${isHidden ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                              {isHidden ? 'ซ่อนจากกราฟรายบุคคล' : 'แสดงในกราฟรายบุคคล'}
                            </span>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <button onClick={() => { setManageUserName(name); setManageDept(dept); setCustomDept(''); }} className="mr-2 text-blue-600 hover:text-blue-700 font-medium">แก้ไข</button>
                            <button onClick={() => setUserHidden(name, !isHidden)} className={`mr-2 font-medium ${isHidden ? 'text-green-600 hover:text-green-700' : 'text-amber-600 hover:text-amber-700'}`}>
                              {isHidden ? 'แสดง' : 'ซ่อน'}
                            </button>
                            <button onClick={() => removeDepartmentMapping(name)} className="text-red-600 hover:text-red-700 font-medium">ลบแผนก</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
        
        {/* --- GRAPH SECTION --- */}
        <section aria-labelledby="chart-heading" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
          
          <div className="p-5 px-6 border-b border-gray-100 flex flex-col gap-5">
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
              <div className="flex items-start gap-3">
                <BarChart3 className="text-blue-500 mt-1" size={24} />
                <div>
                  <h2 id="chart-heading" className="text-lg font-bold text-gray-800">3. กราฟประวัติการใช้งาน</h2>
                  <p className="text-sm text-gray-500">ประวัติการใช้งานจะถูกเซฟเก็บไว้ในเบราว์เซอร์ของคุณ</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2" role="group" aria-label="เลือกมุมมองกราฟ">
                <button 
                  onClick={() => setChartView('overall')}
                  aria-pressed={chartView === 'overall'}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${chartView === 'overall' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <PieChart size={16} /> ภาพรวมทั้งหมด
                </button>
                <button 
                  onClick={() => setChartView('individual')}
                  aria-pressed={chartView === 'individual'}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${chartView === 'individual' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <Users size={16} /> รายบุคคล (แยกแผนก)
                </button>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4" data-html2canvas-ignore>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label htmlFor="history-month" className="block text-xs font-semibold text-gray-500 mb-1">เดือนที่บันทึก</label>
                  <select id="history-month" className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-200" value={selMonthIdx} onChange={e => setSelMonthIdx(e.target.value)}>
                    {TH_MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="history-year" className="block text-xs font-semibold text-gray-500 mb-1">ปี</label>
                  <select id="history-year" className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-200" value={selYear} onChange={e => setSelYear(e.target.value)}>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                {chartView === 'individual' && (
                  <div>
                    <label htmlFor="department-filter" className="block text-xs font-semibold text-gray-500 mb-1">แผนก</label>
                    <select id="department-filter" className="min-w-[190px] border border-gray-300 rounded px-2 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-200" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                      {departmentOptions.map(dept => <option key={dept} value={dept}>{dept === 'All' ? 'ทุกแผนก' : dept}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button onClick={saveToHistory} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm font-medium transition-colors">
                  <Save size={16} /> บันทึกลงกราฟ
                </button>
                <button onClick={handleSaveImage} disabled={isSavingImg} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm font-medium transition-colors">
                  <ImageIcon size={16} /> {isSavingImg ? 'กำลังโหลด...' : 'เซฟเป็นภาพ'}
                </button>
                <button onClick={exportHistoryBackup} className="bg-slate-700 hover:bg-slate-800 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm font-medium transition-colors">
                  <FileDown size={16} /> สำรองข้อมูล
                </button>
                <label className="cursor-pointer bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3 py-1.5 rounded flex items-center gap-1 text-sm font-medium transition-colors">
                  <Upload size={16} /> นำเข้า Backup
                  <input type="file" accept="application/json,.json" className="sr-only" onChange={importHistoryBackup} />
                </label>
                <button onClick={() => setIsConfirmingClear(true)} className="text-red-600 hover:text-red-700 border border-red-200 bg-white px-3 py-1.5 rounded text-sm font-medium">
                  ล้างกราฟ
                </button>
              </div>
            </div>

            {isConfirmingClear && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4" role="alertdialog" aria-labelledby="clear-history-title" aria-describedby="clear-history-description">
                <p id="clear-history-title" className="font-semibold text-red-700">ยืนยันล้างประวัติกราฟ</p>
                <p id="clear-history-description" className="mt-1 text-sm text-red-600">ข้อมูลประวัติที่บันทึกไว้ในเบราว์เซอร์จะถูกลบทั้งหมด</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={clearHistory} className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700">ยืนยันล้างข้อมูล</button>
                  <button onClick={() => setIsConfirmingClear(false)} className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">ยกเลิก</button>
                </div>
              </div>
            )}
          </div>

          <div id="chart-container" className="bg-white">
            
            {/* --- ภาพรวม --- */}
            {chartView === 'overall' && (
              <div className="p-6 pt-14 overflow-x-auto overflow-y-visible custom-scrollbar pb-4">
                <h3 className="text-center font-bold text-gray-700 mb-6 text-lg" data-html2canvas-show>
                  กราฟภาพรวมการใช้งานทุกเครื่อง (ยอดรวมทั้งหมด)
                </h3>
                
                <div className="min-w-[800px] flex relative mt-4 mb-8">
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
                        const tooltip = `${d.month} | รวม ${d.total.toLocaleString()} แผ่น | Copy ${d.copy.toLocaleString()} | Print ${d.print.toLocaleString()} | Color ${d.color.toLocaleString()} | Black ${d.black.toLocaleString()}${i > 0 ? ` | เปลี่ยนแปลง ${formatDelta(diff, diffPercent)}` : ''}`;
                        
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative group" title={tooltip}>
                            <div className="w-full max-w-[120px] flex items-end justify-center gap-1.5 h-full z-0 px-2">
                              <div aria-label={`${d.month} Copy ${d.copy.toLocaleString()} แผ่น`} className="flex-1 rounded-t-sm relative flex justify-center hover:brightness-95" style={{ backgroundColor: COLORS.copy, height: `${(d.copy/yMax)*100}%`, minHeight: d.copy > 0?'2px':'0' }}>
                                {d.copy > 0 && <span className="absolute -top-10 text-[11px] font-bold text-gray-700 -rotate-90 whitespace-nowrap">{d.copy.toLocaleString()}</span>}
                              </div>
                              <div aria-label={`${d.month} Print ${d.print.toLocaleString()} แผ่น`} className="flex-1 rounded-t-sm relative flex justify-center hover:brightness-95" style={{ backgroundColor: COLORS.print, height: `${(d.print/yMax)*100}%`, minHeight: d.print > 0?'2px':'0' }}>
                                {d.print > 0 && <span className="absolute -top-12 text-[11px] font-bold text-gray-700 -rotate-90 whitespace-nowrap">{d.print.toLocaleString()}</span>}
                              </div>
                              <div aria-label={`${d.month} Color ${d.color.toLocaleString()} แผ่น`} className="flex-1 rounded-t-sm relative flex justify-center hover:brightness-95" style={{ backgroundColor: COLORS.color, height: `${(d.color/yMax)*100}%`, minHeight: d.color > 0?'2px':'0' }}>
                                {d.color > 0 && <span className="absolute -top-10 text-[11px] font-bold text-gray-700 -rotate-90 whitespace-nowrap">{d.color.toLocaleString()}</span>}
                              </div>
                              <div aria-label={`${d.month} Black ${d.black.toLocaleString()} แผ่น`} className="flex-1 rounded-t-sm relative flex justify-center hover:brightness-95" style={{ backgroundColor: COLORS.black, height: `${(d.black/yMax)*100}%`, minHeight: d.black > 0?'2px':'0' }}>
                                {d.black > 0 && <span className="absolute -top-12 text-[11px] font-bold text-gray-700 -rotate-90 whitespace-nowrap">{d.black.toLocaleString()}</span>}
                              </div>
                            </div>

                            <div className="absolute w-full flex justify-center pointer-events-none" style={{ bottom: `${hTotalLine}%`, zIndex: 20 }}>
                              <div className="relative flex flex-col items-center">
                                <div className="absolute bottom-4 bg-[#f59e0b] text-white text-xs font-bold px-2.5 py-1 rounded shadow-md whitespace-nowrap border border-white">
                                  {d.total.toLocaleString()}
                                </div>
                                <div className="w-3.5 h-3.5 bg-white border-2 border-[#f59e0b] rounded-full shadow-sm"></div>
                                {i > 0 && (
                                  <div className={`absolute top-4 text-[10px] font-bold px-1.5 py-0.5 rounded border bg-white/85 whitespace-nowrap shadow-sm ${diff >= 0 ? 'text-[#059669] border-emerald-200' : 'text-[#dc2626] border-red-200'}`}>
                                    {diff >= 0 ? '▲ +' : '▼ '}{Math.abs(diffPercent).toFixed(2)} %
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="pointer-events-none absolute left-1/2 top-3 z-30 w-56 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-3 text-left text-xs text-gray-600 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                              <p className="font-bold text-gray-800">{d.month}</p>
                              <p className="mt-1">รวม {d.total.toLocaleString()} แผ่น</p>
                              <p>Copy {d.copy.toLocaleString()} | Print {d.print.toLocaleString()}</p>
                              <p>Color {d.color.toLocaleString()} | Black {d.black.toLocaleString()}</p>
                              {i > 0 && <p className={diff >= 0 ? 'text-emerald-600' : 'text-red-600'}>เปลี่ยนแปลง {formatDelta(diff, diffPercent)}</p>}
                            </div>
                            
                            <div className="absolute -bottom-6 text-sm font-bold text-gray-800 w-full text-center">{d.month}</div>
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
              <div className="p-6 pb-0">
                
                <div className="flex flex-col items-center mb-6" data-html2canvas-show>
                  <h3 className="font-bold text-gray-700 text-lg mb-4">
                    รายงานการใช้เครื่อง KONICA แบบรายบุคคล | {selectedDept !== 'All' ? `แผนก ${selectedDept}` : 'ทุกแผนก'} | ประจำปี {selYear}
                  </h3>
                </div>

                {displayUsers.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-gray-400 font-medium border-2 border-dashed border-gray-200 rounded-lg">
                    ไม่พบข้อมูลพนักงานในแผนกนี้ หรือคุณยังไม่ได้บันทึกข้อมูลลงกราฟ
                  </div>
                ) : (
                  <div className="overflow-x-auto overflow-y-visible custom-scrollbar pb-4">
                    <div className="flex relative mt-4 mb-16" style={{ minWidth: `${indvChartWidth}px` }}>
                      
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
                                    const stackTotal = getStackTotal(uData);
                                    
                                    const hTotal = yMaxIndv > 0 ? (stackTotal / yMaxIndv) * 100 : 0;
                                    const hCopy = stackTotal > 0 ? (uData.copy / stackTotal) * 100 : 0;
                                    const hPrint = stackTotal > 0 ? (uData.print / stackTotal) * 100 : 0;
                                    const hColor = stackTotal > 0 ? (uData.color / stackTotal) * 100 : 0;
                                    const hBlack = stackTotal > 0 ? (uData.black / stackTotal) * 100 : 0;
                                    const tooltip = `${userName} | ${h.month} | รวมบนกราฟ ${stackTotal.toLocaleString()} แผ่น | Copy ${uData.copy.toLocaleString()} | Print ${uData.print.toLocaleString()} | Color ${uData.color.toLocaleString()} | Black ${uData.black.toLocaleString()}`;

                                    return (
                                      <div key={mIdx} className="flex-1 flex flex-col justify-end items-center h-full relative group min-w-[25px] max-w-[40px]" title={tooltip}>
                                        
                                        {stackTotal > 0 && (
                                          <div className="w-full flex flex-col justify-end items-center relative z-10 hover:opacity-90 transition-opacity" style={{ height: `${hTotal}%` }}>
                                            
                                            {/* Stack: Black, Color, Print, Copy (ล่างสุด) */}
                                            {uData.black > 0 && (
                                              <div aria-label={`${userName} ${h.month} Black ${uData.black.toLocaleString()} แผ่น`} className="w-full relative flex flex-col items-center justify-center border-b border-white/20" style={{ height: `${hBlack}%`, backgroundColor: COLORS.black }}>
                                                <span className="text-[9px] font-bold text-white px-1 leading-none">{uData.black.toLocaleString()}</span>
                                              </div>
                                            )}
                                            {uData.color > 0 && (
                                              <div aria-label={`${userName} ${h.month} Color ${uData.color.toLocaleString()} แผ่น`} className="w-full relative flex flex-col items-center justify-center border-b border-white/20" style={{ height: `${hColor}%`, backgroundColor: COLORS.color }}>
                                                <span className="text-[9px] font-bold text-white px-1 leading-none">{uData.color.toLocaleString()}</span>
                                              </div>
                                            )}
                                            {uData.print > 0 && (
                                              <div aria-label={`${userName} ${h.month} Print ${uData.print.toLocaleString()} แผ่น`} className="w-full relative flex flex-col items-center justify-center border-b border-white/20" style={{ height: `${hPrint}%`, backgroundColor: COLORS.print }}>
                                                <span className="text-[9px] font-bold text-gray-800 px-1 leading-none">{uData.print.toLocaleString()}</span>
                                              </div>
                                            )}
                                            {uData.copy > 0 && (
                                              <div aria-label={`${userName} ${h.month} Copy ${uData.copy.toLocaleString()} แผ่น`} className="w-full relative flex flex-col items-center justify-center" style={{ height: `${hCopy}%`, backgroundColor: COLORS.copy }}>
                                                <span className="text-[9px] font-bold text-gray-800 px-1 leading-none">{uData.copy.toLocaleString()}</span>
                                              </div>
                                            )}
                                            <div className="absolute -top-5 text-[10px] font-bold text-gray-700 bg-white/90 px-1 rounded shadow-sm whitespace-nowrap pointer-events-none">
                                              {stackTotal.toLocaleString()}
                                            </div>
                                            
                                            <div className="pointer-events-none absolute -top-24 left-1/2 z-30 w-52 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-3 text-left text-xs text-gray-600 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                                              <p className="font-bold text-gray-800">{userName}</p>
                                              <p>{h.month} | รวมบนกราฟ {stackTotal.toLocaleString()} แผ่น</p>
                                              <p>Copy {uData.copy.toLocaleString()} | Print {uData.print.toLocaleString()}</p>
                                              <p>Color {uData.color.toLocaleString()} | Black {uData.black.toLocaleString()}</p>
                                            </div>
                                          </div>
                                        )}

                                        <div className="absolute -bottom-5 text-[10px] font-semibold text-gray-500 w-full text-center">
                                          {getShortThMonth(h.month)}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>

                                <div className="absolute -bottom-12 text-sm font-bold text-gray-700 w-full text-center pt-1 px-2">
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
            
            <div className="flex flex-wrap justify-center mt-2 pb-4 gap-6 text-sm text-gray-600 font-bold border-t border-gray-100 pt-4">
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm shadow-sm" style={{ backgroundColor: COLORS.copy }}></span> Copy</span>
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm shadow-sm" style={{ backgroundColor: COLORS.print }}></span> Printer</span>
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm shadow-sm" style={{ backgroundColor: COLORS.color }}></span> Color</span>
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm shadow-sm" style={{ backgroundColor: COLORS.black }}></span> Black</span>
            </div>
            
          </div>
        </section>

        {/* --- RESULTS TABLE --- */}
        {(tableData.length > 0 || rawCurrData.length > 0) && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex flex-wrap gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 shadow-sm" role="tablist" aria-label="เลือกชุดข้อมูลตาราง">
              <button type="button" role="tab" aria-selected={activeTab === 'summary'} onClick={() => setActiveTab('summary')} className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'summary' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}>
                <Calculator size={18} /> สรุปยอด (ลบกันแล้ว)
              </button>
              <button type="button" role="tab" aria-selected={activeTab === 'curr'} onClick={() => setActiveTab('curr')} className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'curr' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}>
                <Search size={18} /> ข้อมูลที่อ่านได้: เดือนปัจจุบัน
              </button>
              <button type="button" role="tab" aria-selected={activeTab === 'prev'} onClick={() => setActiveTab('prev')} className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'prev' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}>
                <Search size={18} /> ข้อมูลที่อ่านได้: เดือนก่อนหน้า
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-gray-50">
                <h3 className="font-semibold text-gray-700">{getTabTitle()} <span className="inline-flex text-blue-600 mt-1 sm:mt-0 sm:ml-2 bg-blue-100 px-2 py-0.5 rounded text-xs">ยอดรวม: {displaySummary.total.toLocaleString()} แผ่น</span></h3>
                <button onClick={exportExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                  <FileDown size={16} /> ส่งออก Excel
                </button>
              </div>
              <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <caption className="sr-only">{getTabTitle()}</caption>
                  <thead className="sticky top-0 bg-gray-100 shadow-sm z-10">
                    <tr className="text-gray-600 text-sm">
                      <SortableHeader sortKey="name">ชื่อ (Name)</SortableHeader>
                      <th scope="col" className="p-3 text-left font-semibold">แผนก (Dept)</th>
                      <SortableHeader sortKey="copy" align="right">Copy</SortableHeader>
                      <SortableHeader sortKey="print" align="right">Print</SortableHeader>
                      <SortableHeader sortKey="color" align="right">Color</SortableHeader>
                      <SortableHeader sortKey="black" align="right">Black</SortableHeader>
                      <SortableHeader sortKey="total" align="right" highlight>รวมทั้งหมด</SortableHeader>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortedData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <th scope="row" className="p-3 font-medium text-gray-800">{row.name}</th>
                        <td className="p-3 text-xs text-gray-500">{departmentMap[row.name] || '-'}</td>
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

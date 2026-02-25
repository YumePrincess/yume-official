function init_life_time() {
    function getAsideLifeTime() {
        let nowDate = +new Date();
        let todayStartDate = new Date(new Date().toLocaleDateString()).getTime();
        let todayPassHours = (nowDate - todayStartDate) / 1000 / 60 / 60;
        let todayPassHoursPercent = (todayPassHours / 24) * 100;

        // 填充今日进度
        document.getElementById('dayProgressValue').innerHTML = parseInt(todayPassHours);
        document.querySelector('#dayProgress .progress-bar').style.width = parseInt(todayPassHoursPercent) + '%';
        document.querySelector('#dayProgress .progress-bar').innerHTML = parseInt(todayPassHoursPercent) + '%';

        let weeks = {
            "en": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "zh-cn": ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
            "zh-tw": ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
			"fr": ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
            "ja": ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"]
        };
        let currentLang = localStorage.getItem('lang') || 'en';
        let weekDays = weeks[currentLang];
        
        let weekDay = new Date().getDay();
        let weekDayPassPercent = (weekDay / 7) * 100;

        // 填充本周进度
        document.getElementById('weekProgressValue').innerHTML = weekDay;
        document.querySelector('#weekProgress .progress-bar').style.width = parseInt(weekDayPassPercent) + '%';
        document.querySelector('#weekProgress .progress-bar').innerHTML = parseInt(weekDayPassPercent) + '%';

        let year = new Date().getFullYear();
        let date = new Date().getDate();
        let month = new Date().getMonth() + 1;
        let monthAll = new Date(year, month, 0).getDate();
        let monthPassPercent = (date / monthAll) * 100;

        // 填充本月进度
        document.getElementById('monthProgressValue').innerHTML = date;
        document.querySelector('#monthProgress .progress-bar').style.width = parseInt(monthPassPercent) + '%';
        document.querySelector('#monthProgress .progress-bar').innerHTML = parseInt(monthPassPercent) + '%';

        let yearPass = (month / 12) * 100;

        // 填充今年进度
        document.getElementById('yearProgressValue').innerHTML = month;
        document.querySelector('#yearProgress .progress-bar').style.width = parseInt(yearPass) + '%';
        document.querySelector('#yearProgress .progress-bar').innerHTML = parseInt(yearPass) + '%';
    }

    getAsideLifeTime();
    setInterval(() => {
        getAsideLifeTime();
    }, 1000);
}

init_life_time();

// 获取当前问候语
now = new Date(), hour = now.getHours()
if (hour < 6) {
    var hello = translate('EARLY_MORNING');
} else if (hour < 9) {
    var hello = translate('GOOD_MORNING');
} else if (hour < 12) {
    var hello = translate('GOOD_SHANGWU');
} else if (hour < 14) {
    var hello = translate('GOOD_AFTERNOON');
} else if (hour < 17) {
    var hello = translate('GOOD_XIAWU');
} else if (hour < 19) {
    var hello = translate('GOOD_BANGWAN');
} else if (hour < 22) {
    var hello = translate('GOOD_EVENING');
} else {
    var hello = translate('GOOD_NIGHT');
}
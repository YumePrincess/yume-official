function updateProgress(id, value, percent, remainingValue, unitKey) {
    const item = document.getElementById(id);
    if (!item) return;

    const numericPercent = Math.max(0, Math.min(100, Number(percent) || 0));
    const progressValue = `${numericPercent}%`;
    const progressText = `${percent}%`;
    const progress = item.querySelector('.progress');
    const bar = item.querySelector('.progress-bar');
    const label = item.querySelector('.progress-percent');

    document.getElementById(id + 'Value').textContent = value;
    bar.style.width = progressValue;
    progress.style.setProperty('--progress-value', progressValue);
    label.textContent = progressText;
    label.dataset.progressText = progressText;

    // 剩余时间多语言
    const text = translate("REMAINING") + " " + remainingValue + " " + translate(unitKey);
    document.getElementById(id.replace("Progress", "Remaining")).textContent = text;
}

// 初始化并每秒刷新
function initLifeTime() {
    function getTime() {
        const now = new Date();
        const startOfDay = new Date(now.toLocaleDateString());
        const hoursPassed = (now - startOfDay) / 1000 / 60 / 60;

        const dayPercent = (hoursPassed / 24) * 100;
        updateProgress("dayProgress", Math.floor(hoursPassed), dayPercent.toFixed(1), Math.floor(24 - hoursPassed), "DAY_PROGRESS1");

        const weekDay = now.getDay();
        const weekPercent = (weekDay / 7) * 100;
        updateProgress("weekProgress", weekDay, weekPercent.toFixed(1), 7 - weekDay, "WEEK_PROGRESS1");

        const date = now.getDate();
        const month = now.getMonth() + 1;
        const daysInMonth = new Date(now.getFullYear(), month, 0).getDate();
        const monthPercent = (date / daysInMonth) * 100;
        updateProgress("monthProgress", date, monthPercent.toFixed(1), daysInMonth - date, "MONTH_PROGRESS1");

        const yearPercent = (month / 12) * 100;
        updateProgress("yearProgress", month, yearPercent.toFixed(1), 12 - month, "YEAR_PROGRESS1");
    }

    getTime();
    setInterval(getTime, 1000);
}

// 页面加载
$(document).ready(function() {
    updateTextContent(); // 更新页面文本
    initLifeTime();       // 初始化时间胶囊
});

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

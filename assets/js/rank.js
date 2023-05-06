$(function () {
    $("#srank").append(addtime($("#srank").attr("value")));
    $("#arank").append(addtime($("#arank").attr("value")));
    $("#brank").append(addtime($("#brank").attr("value")));
    $("#crank").append(addtime($("#crank").attr("value")));
    $("#drank").html($("#crank").attr("value"));
    $("#drank").append("+");
});

function addtime(totalSeconds) {
    var res = totalSeconds
    res += " (";
    var hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    if (hours > 0) {
        res += hours + " hour";
        if (hours > 1) res += "s"
        if (minutes > 0) {
            if (seconds == 0) res += " and ";
            else res += ", ";
        }
    }
    if (minutes > 0) {
        res += minutes + " minute";
        if (minutes > 1) res += "s"
        if (hours > 0 && seconds > 0) res += ","
    }
    if (seconds > 0) {
        res += " and " + seconds + " second";
        if (seconds > 1) res += "s"
    }
    res += ")"
    return res;
}
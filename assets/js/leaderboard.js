// SPEEDRUN SCRIPT

$(function () {
    var pagetitle = $('#scriptData').data('title');

    //Get all maps
    var api_url = "https://www.speedrun.com/api/v1/games/pd0wpq21/levels";

    $.ajax({
        url: api_url,
        contentType: "application/json",
        dataType: 'json',
        success: function (result) {
            result.data.forEach(map => {

                //If map matches the page title
                if (map.name === pagetitle) {

                    //Get leaderboard url from map
                    leaderboardurl = map.links[6].uri + "?var-r8ro7y78=klr06wwl&top=1&embed=players";

                    //Retrieve leaderboard
                    $.ajax({
                        url: leaderboardurl,
                        contentType: "application/json",
                        dataType: 'json',
                        success: function (result) {

                            //get top run
                            if (result.data.runs.length === 0) {
                                norun(result);
                            } else {
                                let run = result.data.runs[0].run;

                                //map link
                                let link = result.data.weblink;
                                $('#record_link_2').attr("href", link);

                                let name = result.data.players.data[0].names.international
                                let video_url = run.weblink;

                                $("#record_author").html("By ");
                                $("#record_author_name").html(name);
                                $("#record_author_name").attr("href", video_url);

                                //Get the time
                                let totalSeconds = run.times.primary_t;
                                let tempSeconds = totalSeconds;

                                let hours = Math.floor(tempSeconds / 3600);
                                tempSeconds %= 3600;
                                let minutes = Math.floor(tempSeconds / 60);
                                let seconds = tempSeconds % 60;

                                $("#record").html(totalSeconds);
                                $("#record_hms").html("(");
                                if (hours > 0) $("#record_hms").append(hours + " hours, ");
                                $("#record_hms").append(minutes + " minutes");
                                if (hours > 0) $("#record_hms").append(",");
                                $("#record_hms").append(" and " + seconds + " seconds");
                                $("#record_hms").append(")");

                                onFinish();
                            }
                        }
                    });
                }
            });
        }
    })
});

function norun(result) {
    $("#record").html("No runs yet");
    $("#record").css("font-size", "25px");

    var link = result.data.weblink

    //change small text to link
    $('#record_hms').hide();
    $('#record_link').show();
    $('#record_link').attr("href", link);
    $('#compete').hide();
    onFinish();
}

function onFinish() {
    $('.speedrun-section').delay(200).show();
}
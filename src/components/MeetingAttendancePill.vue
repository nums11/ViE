<template>

    <div class="meeting-attendance-pill">
        <div class="pill-container">
            <div class="left-side">January 7th</div>
            <div class="right-side">
                <div class="icon-area"><img src="@/assets/icons/001-qr-code.svg" width="100%" height="100%"/></div>
                <div class="icon-area"><img src="@/assets/icons/002-link.svg" width="100%" height="100%"/></div>
                <div class="icon-area"><img src="@/assets/icons/003-play-button.svg" width="100%" height="100%"/></div>
                <div class="icon-area"><img src="@/assets/icons/005-file.svg" width="100%" height="100%"/></div>
                <div class="icon-area"><img src="@/assets/icons/001-ballot.svg" width="100%" height="100%"/></div>
            </div>
        </div>
    </div>

</template>
<script>

</script>
<style lang="scss">

.meeting-attendance-pill {
    display: inline-block;
    min-width: 270px;
    margin-right: 12px;
    margin-bottom: 10px;
    box-sizing: border-box;
    padding: 0 10px;
    height: 30px;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.25s, box-shadow 0.25s;

    .pill-container {
        height: 30px;
        display: flex;
        align-items: center;
        font-weight: 600;

        .left-side {
            flex-grow: 1;
        }

        .right-side {
            
            .icon-area {
                width: 18px;
                height: 18px;
                display: inline-block;
                margin-left: 7px;
                position: relative;
                top: 3px;
            }
        }
    }
}

.light-mode {
    
    .meeting-attendance-pill {
        background-color: white;
        box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.12);

        .pill-container {
            color: rgba(0, 0, 0, 0.7);
        }
    }

    .meeting-attendance-pill:hover {
        box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.17);
    }
}

.dark-mode {

    .meeting-attendance-pill {
        background-color: #22252e;

        .pill-container {

            .right-side {
                .icon-area {
                    img {
                        filter: invert(100%);
                    }
                }
            }
        }
    }

    .meeting-attendance-pill:hover {
        background-color: #2f3340;
    }
}

</style>
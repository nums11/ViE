<template>

  <div class="student-list">
    <div class="list-header">
      <div class="checkbox-area">
        <sui-checkbox label="" />
      </div>
      <div class="firstname-area">First Name</div>
      <div class="lastname-area">Last Name</div>
      <div class="email-area">Email</div>
      <div class="status-area">Status</div>
    </div>

    <div class="list-student-area" v-for="(student, i) in students" :key="i">
      <div class="checkbox-area">
        <sui-checkbox label="" />
      </div>
      <div class="firstname-area">{{ student.first_name }}</div>
      <div class="lastname-area">{{ student.last_name }}</div>
      <div class="email-area">{{ student.email }}</div>
      <div class="status-area enrolled">Enrolled</div>
    </div>
  </div>

</template>
<script>
export default {
  name: "StudentList",
  props: {
    students: {}
  }
}
</script>
<style lang="scss">

  .student-list {
    width: 100%;

    div {
      height: 30px;
      line-height: 30px;
    }

    .list-header {
      display: flex;
      align-items: center;
      background-color: #282c36;
      color: white;
      height: 35px;
      line-height: 35px;

      div {
        box-sizing: border-box;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.85rem;
        cursor: pointer;
      }

      .checkbox-area {
        margin-top: 10px;
      }
    }

    .list-student-area {
      display: flex;
      cursor: pointer;
      transition: background 0.25s;
      
      &:hover {
        background-color: rgba(71, 196, 252, 0.2);
      }

      .checkbox-area {
        margin-top: 6px;
      }
    }

    .checkbox-area {
      width: 5%;
      min-width: 5%;
      text-align: center;
    }

    .firstname-area {
      width: 30%;
      max-width: 30%;
    }

    .lastname-area {
      width: 30%;
      max-width: 30%;
    }

    .email-area {
      width: 20%;
      max-width: 20%;
    }

    .status-area {
      width: 15%;
      max-width: 15%;
      font-size: 0.85rem;
      text-transform: uppercase;

      &.enrolled {
        color: #49de99;
      }
    }
  }

</style>
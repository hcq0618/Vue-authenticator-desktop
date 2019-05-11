/* eslint-disable standard/no-callback-literal */
/* eslint-disable handle-callback-err */
/* eslint-disable indent */
/* eslint-disable space-before-function-paren */
<template>
  <div id="app">
    <el-col>
      <el-row v-for="(item, index) in accounts" :key="item.secret">
        <!-- item -->
        <el-card>
          <!-- issuer -->
          <div class="item-issuer">{{item.issuer}}</div>

          <el-row type="flex" align="middle">
            <!-- counter -->
            <el-col :span="6">
              <el-progress type="circle" :percentage="item.percentage" :color="item.counterColor" :stroke-width="5"
                :width="35" :show-text="false" status="text">
              </el-progress>
            </el-col>

            <!-- token -->
            <el-col :span="12">
              <div class="item-token">{{item.token}}</div>
            </el-col>

            <!-- copy -->
            <el-col :span="2">
              <el-button class="copy" type="info" size="mini" icon="el-icon-document-copy" circle
                @click="doCopy(item.token)" />
            </el-col>

            <!-- QRCode -->
            <el-col :span="2">
              <el-popover placement="bottom" width="200" trigger="hover">
                <el-image :src="item.qrCode" fit="fit"></el-image>
                <el-button type="info" slot="reference" size="mini" icon="el-icon-s-grid" circle />
              </el-popover>
            </el-col>

            <!-- delete -->
            <el-col :span="2">
              <el-button type="danger" size="mini" icon="el-icon-delete" circle @click="doDelete(item)" />
            </el-col>
          </el-row>

          <!-- account -->
          <div class="item-account">{{item.account}}</div>
        </el-card>
      </el-row>

      <!-- select file button -->
      <el-row type="flex" justify="center">
        <el-upload class="select" ref="select" action="" :auto-upload="false" :on-change="handleSelectChange"
          list-type="picture">
          <el-button slot="trigger" size="medium" type="primary">Select a QRCode file to add an account
          </el-button>
        </el-upload>
      </el-row>

      <!-- select file tip -->
      <el-row type="flex" justify="center">
        <div class="select-tip">Only JPG/PNG file can be selected, and no more than 500kb</div>
      </el-row>
    </el-col>
  </div>
</template>

<script>
import { parseAuthUriFromFile, getAccounts, updateAccounts, copy, deleteAccount } from './authenticator'

export default {
  data: function () {
    return {
      accounts: getAccounts(),
      timer: setInterval(() => {
        this.countersUpdate()
      }, 1000)
    }
  },
  methods: {
    handleSelectChange (file, fileList) {
      var _this = this
      // Clear the selected file
      this.$refs.select.clearFiles()
      parseAuthUriFromFile(file.raw, function (success, accounts) {
        if (success) {
          _this.accounts = accounts
        }
      })
    },
    countersUpdate () {
      this.accounts = updateAccounts(this.accounts)
    },
    doCopy: function (token) {
      copy(token)
    },
    doDelete: function (item) {
      this.$confirm('Do you make sure to delete the account?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        deleteAccount(item)
        this.accounts = getAccounts()
        this.$message({
          type: 'success',
          message: 'Delete success!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Canceled delete'
        })
      })
    }
  },
  destroyed () {
    clearInterval(this.timer)
  }
}
</script>

<style>
  /* CSS */
.el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
}

.item-issuer{
    color:#606266;
    margin-bottom: 15px;
}

.item-token{
    color: #409EFF;
    font-size: 36pt;
}

.item-account{
    color:#909399;
}

.select{
    margin-top: 20px;
}

.select-tip{
    font-size: 10pt;
    color:#909399;
    padding-left: 5px;
    padding-right: 5px;
}
</style>

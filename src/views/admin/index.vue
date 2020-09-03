<template>

  <div class="app-container">
      <el-header style="margin-left: -20px">
        <el-input placeholder="请输入用户名" v-model="name" style="width: 200px" clearable size="medium"></el-input>
        <el-input placeholder="请输入手机号" class="filter-item" v-model="phone" style="width: 200px;margin-left: 10px"
                  clearable size="medium">
        </el-input>
        <el-select v-model="statusValue" style="margin-left: 10px" size="medium" placeholder="请选择">
          <el-option v-for="item in status" :key="item.value" :label="item.name" :value="item.value">
          </el-option>
        </el-select>
        <el-button style="margin-left: 10px" type="primary" icon="el-icon-search" size="small" @click="search" plain>搜索</el-button>
        <el-button type="primary" icon="el-icon-edit" size="small" @click="adminCreate" v-permission="['admin_create']">添加</el-button>
      </el-header>

      <el-table
        v-loading="listLoading"
        :data="list"
        border
        fit
        :row-style="{height: '40px'}"
        :cell-style="{padding: '0'}"
        style="width: 100%">
        <el-table-column prop="id" label="ID" width="60"></el-table-column>
        <el-table-column prop="name" label="用户名" width="120"></el-table-column>
        <el-table-column prop="phone" label="手机号" width="150"></el-table-column>
        <el-table-column prop="status_name" label="状态" width="180"></el-table-column>
        <el-table-column prop="created_at" label="创建日期" width="180"></el-table-column>
        <el-table-column prop="updated_at" label="修改日期"></el-table-column>
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              circle
              icon="el-icon-edit"
              v-permission="['admin_edit']"
              @click="handleEdit(scope.$index, scope.row)"></el-button>
            <el-button
              size="mini"
              type="success"
              icon="el-icon-user"
              circle
              v-permission="['admin_role']"
              @click="handleRole(scope.$index, scope.row)"></el-button>
            <el-button
              size="mini"
              type="danger"
              circle
              icon="el-icon-delete"
              v-permission="['admin_delete']"
              @click="handleDelete(scope.$index, scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block" style="margin-top: 10px">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="pageSizes"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>

    <el-dialog :title="formStatus" :visible.sync="formDialog" width="500px" :before-close="handleClose">
      <el-form ref="form" :model="form" :rules="rules" style="margin-left: 50px" label-width="80px">

        <el-form-item label="用户名" prop="name">
          <el-input v-model="form.name" style="width: 200px" placeholder="请输入" clearable></el-input>
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" style="width: 200px" maxlength="11" placeholder="请输入" clearable></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" style="width: 200px" placeholder="请输入" show-password clearable></el-input>
        </el-form-item>

        <el-form-item label="确认密码" prop="password_confirmation">
          <el-input v-model="form.password_confirmation" style="width: 200px" placeholder="请输入" show-password clearable></el-input>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="formStatus === '新增用户' ? confirmCreate() : confirmUpdate()">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="adminRoleForm.titleStatus" :visible.sync="adminRoleForm.dialog" width="500px" :before-close="cancelAllot">
      <el-form ref="roleForm" :model="adminRoleForm" style="margin-left: 50px" label-width="80px">

        <el-form-item label="用户名" prop="name">
          <el-input v-model="adminRoleForm.name" :disabled="true" style="width: 200px" placeholder="请输入" clearable></el-input>
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="adminRoleForm.phone" :disabled="true" style="width: 200px" maxlength="11" placeholder="请输入" clearable></el-input>
        </el-form-item>

        <el-form-item label="角色" prop="role">
            <el-checkbox-group v-for="roles in checkRole" v-model="adminRoleForm.checkedRole">
              <el-checkbox :key="roles.id" :label="roles.id" border size="medium">{{ roles.name }}</el-checkbox>
            </el-checkbox-group>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelAllot">取 消</el-button>
        <el-button type="primary" @click="confirmAllot">确 定</el-button>
      </span>
    </el-dialog>

  </div>

</template>

<script>

  import { adminList, adminCreate, adminUpdate, adminRole, adminDestroy, getRole } from '@/api/admin'
  import store from '@/store'
  import permission from '@/directive/permission/index.js' // 权限判断指令
  import checkPermission from '@/utils/permission'

  export default {
    name: 'adminTable',
    directives: { permission },
    data() {
      var validatePhone = (rule, value, callback) => {
        if (value === "") {
          callback(new Error("请输入手机号"));
        } else {
          if (!/^1[3456789]\d{9}$/.test(value)) {
            callback(new Error("请输入正确的手机号"));
          } else {
            callback();
          }
        }
      };
      var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.form.password) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
      return {
        list: null,
        currentPage: 1,
        pageSizes: [10, 20, 30, 40, 50, 100],
        pageSize: 10,
        total: null,
        listLoading: false,
        name: '',
        phone: '',
        status: [{
          value: '1',
          name: '开启'
        }, {
          value: '2',
          name: '关闭'
        }],
        statusValue: '',
        // 搜索参数
        listSearch: {
          name: null,
          phone: null,
          page: 1,
          limit: 10,
          status: null
        },
        // 添加编辑用户参数
        form: {
          id: undefined,
          name: '',
          phone: '',
          password: '',
          password_confirmation: ''
        },
        formDialog: false,
        formStatus: '',
        rules: {
          name: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { max: 14, message: '最长14个字符', trigger: 'blur' }
          ],
          phone: [
            { required: true, message: '请输入手机号', trigger: 'blur' },
            { validator: validatePhone, trigger: 'change' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 14, message: '请输入6-14位密码', trigger: 'blur' }
          ],
          password_confirmation: [
            { required: true, message: '请输入确认密码', trigger: 'blur' },
            { validator: validatePass2, trigger: 'change' }
          ]
        },
        roleRules: {
          role: [
            { type: 'array', required: true, message: '请选择角色', trigger: 'change' }
          ]
        },
        // 分配角色
        adminRoleForm: {
          id: undefined,
          name: '',
          phone: '',
          checkedRole: [],
          dialog: false,
          titleStatus: '分配角色',
          type: []
        },
        checkRole: []
      }
    },
    created() {
      this.getData()
      this.getRole()
    },
    methods: {
      getData() {
        this.listLoading = true
        adminList(this.listSearch).then(response => {
          this.listLoading = false
          if (response.data.code == 200) {
            if (response.data.data.length <= 0 && (this.listSearch.page - 1) > 0) {
              this.listSearch.page = this.listSearch.page -1
              this.getData()
            } else {
              this.list = response.data.data
              this.total = response.data.total
            }
          } else {
            this.$message.error('获取数据错误')
          }
        }).catch(error => {
          if (error.response.data.code == 401) {
            this.$message({
              message: '请重新登录',
              type: 'error',
              duration: 5 * 1000
            })
            store.dispatch('admin/FedLogOut').then(() => {
              this.$router.push(`/login?redirect=${this.$route.fullPath}`)
            })
          } else {
            this.$message.error('请求错误')
          }
        })
      },
      search() {
        this.listSearch.name = this.name
        this.listSearch.phone = this.phone
        this.listSearch.status = this.statusValue
        this.getData()
      },
      handleSizeChange(val) {
        this.listSearch.limit = val
        this.getData()
      },
      handleCurrentChange(val) {
        this.listSearch.page = val
        this.getData()
      },
      // 初始化表单
      resetTemp() {
        this.form = {
          id: undefined,
          name: '',
          phone: '',
          password: '',
          password_confirmation: ''
        }
      },
      // 添加用户
      adminCreate() {
        this.resetTemp()
        this.formStatus = '新增用户'
        this.formDialog = true
        this.$nextTick(() => {
          this.$refs['form'].clearValidate()
        })
      },
      handleEdit(key, index) {
        this.form = {
          id: index.id,
          name: index.name,
          phone: index.phone,
          password: '',
          password_confirmation: ''
        }
        this.formStatus = '编辑用户'
        this.formDialog = true
        this.$nextTick(() => {
          this.$refs['form'].clearValidate()
        })
      },
      // 分配角色
      handleRole(key, index) {
        this.adminRoleForm.id = index.id
        this.adminRoleForm.name = index.name
        this.adminRoleForm.phone = index.phone
        this.adminRoleForm.checkedRole = index.roles
        this.adminRoleForm.dialog = true
      },
      // 获取角色
      getRole() {
        this.listLoading = true
        getRole().then(response => {
          this.listLoading = false
          if (response.data.code == 200) {
            this.checkRole = response.data.data
          } else {
            this.$message.error('获取角色错误')
          }
        })
      },
      // 删除角色
      handleDelete(key, index) {
        this.$confirm('是否永久删除该用户?', '请确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let id = {
            'id': index.id
          }
          this.listLoading = true
          adminDestroy(id).then(response => {
            this.listLoading = false
            if (response.data.code == 200) {
              this.$message({
                message: response.data.message,
                type: 'success'
              })
              this.getData()
            } else {
              this.$message.error(response.data.message)
            }
          })
        }).catch(() => {
        });
      },
      handleClose() {
        this.formDialog = false
      },
      confirmCreate() {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            // 新增用户
            this.listLoading = true
            adminCreate(this.form).then(response => {
              this.listLoading = false
              if (response.data.code == 200) {
                this.$message({
                  message: response.data.message,
                  type: 'success'
                })
                this.getData()
                this.formDialog = false;
              } else {
                this.$message.error(response.data.message)
              }
            })
          }
        })
      },
      confirmUpdate() {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            // 编辑用户
            this.listLoading = true
            adminUpdate(this.form).then(response => {
              this.listLoading = false
              if (response.data.code == 200) {
                this.$message({
                  message: response.data.message,
                  type: 'success'
                })
                this.getData()
                this.formDialog = false;
              } else {
                this.$message.error(response.data.message)
              }
            })
          }
        })
      },
      // 确认分配
      confirmAllot() {
        this.$refs['roleForm'].validate((valid) => {
          if (valid) {
            // 分配角色
            this.listLoading = true
            let adminRoleData = {
              id: this.adminRoleForm.id,
              role: this.adminRoleForm.checkedRole
            }
            adminRole(adminRoleData).then(response => {
              this.listLoading = false
              if (response.data.code == 200) {
                this.$message({
                  message: response.data.message,
                  type: 'success'
                })
                this.getData()
                this.adminRoleForm = {
                  id: undefined,
                  name: '',
                  phone: '',
                  checkedRole: [],
                  dialog: false,
                  titleStatus: '分配角色',
                  type: []
                }
                location.reload()
              } else {
                this.$message.error(response.data.message)
              }
            })
          }
        })
      },
      cancelAllot() {
        this.adminRoleForm.dialog = false;
      }
    }
  }
</script>

<style scoped>

</style>

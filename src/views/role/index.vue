<template>

  <div class="app-container">
    <el-header style="margin-left: -20px" v-permission="['role_create']">
      <el-button type="primary" icon="el-icon-edit" size="small" @click="roleCreate">添加</el-button>
    </el-header>

    <el-table
      v-loading="listLoading"
      :data="roleList"
      border
      fit
      :row-style="{height: '40px'}"
      :cell-style="{padding: '0'}"
      style="width: 100%">
      <el-table-column prop="id" label="ID" width="60"></el-table-column>
      <el-table-column prop="name" label="角色名" width="120"></el-table-column>
      <el-table-column prop="status_name" label="状态" width="180"></el-table-column>
      <el-table-column prop="created_at" label="创建日期" width="180"></el-table-column>
      <el-table-column prop="updated_at" label="修改日期" width="180"></el-table-column>
      <el-table-column prop="role_admin" label="创建者" :formatter="tableAdmin"></el-table-column>
      <el-table-column label="操作" width="150px">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            circle
            icon="el-icon-edit"
            v-permission="['role_edit']"
            @click="handleEdit(scope.$index, scope.row)"></el-button>
          <el-button
            size="mini"
            type="warning"
            icon="el-icon-star-off"
            circle
            v-permission="['role_permission']"
            @click="handlePermission(scope.$index, scope.row)"></el-button>
          <el-button
            size="mini"
            type="danger"
            circle
            icon="el-icon-delete"
            v-permission="['role_delete']"
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

    <el-dialog :title="dialogStatus" :visible.sync="roleDialog" width="500px" :before-close="handleClose">
      <el-form ref="roleForm" :model="roleForm" :rules="rules" style="margin-left: 50px" label-width="80px">

        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" style="width: 200px" placeholder="请输入"></el-input>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="dialogStatus === '新增角色' ? confirmCreate() : confirmUpdate()">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="permissionRoleForm.permissionRole" :visible.sync="permissionRoleForm.permissionRoleDialog" width="500px"
               :before-close="handlePermissionRoleClose">
      <el-form ref="permissionRoleForm" :model="permissionRoleForm" style="margin-left: 50px" label-width="80px">

        <el-form-item label="角色名称" prop="name">
          <el-input v-model="permissionRoleForm.name" :disabled="true" style="width: 200px" placeholder="如：system.index"></el-input>
        </el-form-item>

        <el-form-item label="权限" prop="permission">
          <el-tree
            :data="permissionRoleForm.permission"
            ref="permissionTree"
            :check-strictly="true"
            default-expand-all
            show-checkbox
            node-key="id"
            :highlight-current="true"
            :default-checked-keys="permissionRoleForm.defaultPermission"
            @check="check"
            :props="permissionRoleForm.defaultProps">
          </el-tree>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelPermission">取 消</el-button>
        <el-button type="primary" @click="confirmPermission">确 定</el-button>
      </span>
    </el-dialog>

  </div>

</template>

<script>

  import { roleList, roleCreate, roleUpdate, createRolePermission, roleDestroy } from '@/api/role'
  import { permissionList } from '@/api/permission'
  // import permission from '@/store/modules/permission'
  import permission from '@/directive/permission/index.js' // 权限判断指令
  import checkPermission from '@/utils/permission'
  import store from '@/store'

  export default {
    name: 'adminTable',
    directives: { permission },
    data() {
      return {
        roleList: null,
        currentPage: 1,
        pageSizes: [10, 20, 30, 40, 50, 100],
        pageSize: 10,
        total: null,
        listLoading: false,
        // 弹出层参数
        dialogStatus: '',
        roleDialog: false,
        // 搜索参数
        listSearch: {
          page: 1,
          limit: 10,
        },
        // 表单参数
        roleForm: {
          id: undefined,
          name: ''
        },
        rules: {
          name: [
            { required: true, message: '请输入角色名称', trigger: 'blur' }
          ]
        },
        // 权限表单参数
        permissionRoleForm: {
          id: undefined,
          name: '',
          permission: [],
          defaultPermission: [],
          permissionRole: '分配权限',
          permissionRoleDialog: false,
          defaultProps: {
            label: 'display_name',
            children: 'all_child'
          }
        },
      }
    },
    created() {
      this.getData()
      this.getPermission()
    },
    methods: {
      // 格式创建者
      tableAdmin: function(row, column, cellValue) {
        if (cellValue === null) {
          return '';
        } else {
          return cellValue.name
        }
      },
      getData() {
        this.listLoading = true
        roleList(this.listSearch).then(response => {
          this.listLoading = false
          if (response.data.data.length <= 0 && (this.listSearch.page - 1) > 0) {
            this.listSearch.page = this.listSearch.page -1
            this.getData()
          } else {
            this.roleList = response.data.data
            this.total = response.data.total
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
      handleSizeChange(val) {
        this.listSearch.limit = val
        this.getData()
      },
      handleCurrentChange(val) {
        this.listSearch.page = val
        this.getData()
      },
      // 添加角色
      roleCreate() {
        this.resetTemp()
        this.roleDialog = true
        this.dialogStatus = '新增角色'
        this.$nextTick(() => {
          this.$refs['roleForm'].clearValidate()
        })
      },
      // 编辑角色
      handleEdit(key, index) {
        this.roleForm = {
          id: index.id,
          name: index.name
        }
        this.roleDialog = true
        this.dialogStatus = '编辑角色'
        this.$nextTick(() => {
          this.$refs['roleForm'].clearValidate()
        })
      },
      // 分配权限
      handlePermission(key, index) {
        this.permissionRoleForm.id = index.id
        this.permissionRoleForm.name = index.name
        this.permissionRoleForm.defaultPermission = index.permissions
        this.permissionRoleForm.permissionRoleDialog = true
        this.$nextTick(() => {
          this.$refs['permissionTree'].setCheckedKeys(index.permissions)
        })
      },
      // 获取权限
      getPermission() {
        this.listLoading = true
        permissionList().then(response => {
          this.listLoading = false
          if (response.data.code == 200) {
            this.$set(this.permissionRoleForm, 'permission', this.getTreeData(response.data.data))
            // this.$nextTick(() => {
            //   this.$refs['permissionRoleForm'].clearValidate()
            // })
          } else {
            this.$message.error('获取父级权限错误')
          }
        })
      },
      // 递归过滤权限树空元素
      getTreeData(data) {
        for (let i=0; i<data.length; i++ ) {
          if (data[i].all_child.length < 1) {
            data[i].all_child = undefined
          } else {
            this.getTreeData(data[i].all_child)
          }
        }
        return data
      },
      handleDelete(key, index) {
        this.$confirm('是否永久删除该角色?', '请确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let id = {
            'id': index.id
          }
          this.listLoading = true
          roleDestroy(id).then(response => {
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
        this.roleDialog = false;
      },
      handlePermissionRoleClose() {
        this.permissionRoleForm.permissionRoleDialog = false;
      },
      cancel() {
        this.roleDialog = false;
      },
      // 新增
      confirmCreate() {
        this.$refs['roleForm'].validate((valid) => {
          if (valid) {
            // 添加角色
            this.listLoading = true
            roleCreate(this.roleForm).then(response => {
              this.listLoading = false
              if (response.data.code == 200) {
                this.$message({
                  message: response.data.message,
                  type: 'success'
                })
                this.getData()
                this.roleDialog = false;
              } else {
                this.$message.error(response.data.message)
              }
            })
          }
        })
      },
      // 编辑
      confirmUpdate() {
        this.$refs['roleForm'].validate((valid) => {
          if (valid) {
            // 编辑角色
            this.listLoading = true
            roleUpdate(this.roleForm).then(response => {
              this.listLoading = false
              if (response.data.code == 200) {
                this.$message({
                  message: response.data.message,
                  type: 'success'
                })
                this.getData()
                this.roleDialog = false;
              } else {
                this.$message.error(response.data.message)
              }
            })
          }
        })
      },
      // 权限
      confirmPermission() {
        // 角色添加权限
        const param = {
          'id': this.permissionRoleForm.id,
          'permission': this.permissionRoleForm.defaultPermission
        }
        this.listLoading = true
        createRolePermission(param).then(response => {
          this.listLoading = false
          if (response.data.code == 200) {
            this.$message({
              message: response.data.message,
              type: 'success'
            })
            this.getData()
            this.permissionRoleForm.permissionRoleDialog = false;
            location.reload()
          } else {
            this.$message.error(response.data.message)
          }
        })
      },
      // 权限取消
      cancelPermission() {
        this.permissionRoleForm.permissionRoleDialog = false
        this.permissionRoleForm.defaultPermission = []
      },
      // 重置表单元素
      resetTemp() {
        this.roleForm = {
          name: ''
        }
      },
      check(data, type) {
        let checked = []
        if (data.all_child && data.all_child !== undefined) {
          checked = this.checkTree(data.all_child);
        }
        checked.push(data.id)
        let permission = this.permissionRoleForm.defaultPermission
        // 判断是勾选还是取消勾选
        if (type.checkedKeys.indexOf(data.id) != -1) {
          if (data.parent_id !== 0) {
            permission = permission.concat(this.parentCheckTree(this.$refs.permissionTree.getNode(data.parent_id)))
          }
          // 合并去重
          permission = this.uniq(permission.concat(checked))
          this.$refs.permissionTree.setCheckedKeys(permission, true)
          this.permissionRoleForm.defaultPermission = permission
        } else {
          for (let i=0; i<checked.length; i++) {
            if (permission.indexOf(checked[i]) !== -1) {
              permission.splice(permission.indexOf(checked[i]), 1)
            }
            permission = this.uniq(permission)
          }
          permission = this.uniq(permission)
          this.$refs.permissionTree.setCheckedKeys(permission, true)
          this.permissionRoleForm.defaultPermission = permission
        }
      },
      // 根据key获取属性组件子节点和父节点
      checkTree(data, cancel = []) {
        if (!data) {
          return
        }
        for (let i=0; i<data.length; i++) {
          cancel.push(data[i].id)
          if (data[i].all_child && data[i].all_child !== undefined) {
            this.checkTree(data[i].all_child, cancel)
          }
        }
        return cancel
      },
      // 获取当前选中节点的父级
      parentCheckTree(data, parent = []) {
        if (!data) {
          return
        }
        if (data.key !== undefined) {
          parent.push(data.key)
          this.parentCheckTree(data.parent, parent)
        }
        return parent
      },
      // 数组去重
      uniq(data) {
        let temp = []
        for (let i=0; i<data.length; i++) {
          if (temp.indexOf(data[i]) == -1) {
            temp.push(data[i])
          }
        }
        return temp
      }
    }
  }
</script>

<style scoped>

</style>

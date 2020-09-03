<template>

  <div class="app-container">
    <el-header style="margin-left: -20px" v-permission="['permission_create']">
      <el-button type="primary" icon="el-icon-edit" size="small" @click="permissionCreate">添加</el-button>
    </el-header>

    <el-table
      v-loading="listLoading"
      :data="permissionList"
      row-key="id"
      border
      fit
      :row-style="{height: '40px'}"
      :cell-style="{padding: '0'}"
      style="width: 100%"
      :tree-props="treeProps">
      <el-table-column type="index" label="编号" width="60"></el-table-column>
      <el-table-column prop="display_name" label="显示名称" width="200"></el-table-column>
      <el-table-column prop="name" label="权限名称" width="200"></el-table-column>
      <el-table-column prop="type_name" label="类型" width="120">
        <template slot-scope="scope">
          <el-button v-if="scope.row.type == 1" type="success" size="mini" plain>按钮</el-button>
          <el-button v-else type="primary" size="mini" plain>菜单</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建日期" width="180"></el-table-column>
      <el-table-column prop="updated_at" label="修改日期" width="180"></el-table-column>
      <el-table-column prop="permission_admin" label="创建者" :formatter="tableAdmin"></el-table-column>
      <el-table-column label="操作" width="120px">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            circle
            icon="el-icon-edit"
            v-permission="['permission_edit']"
            @click="handleEdit(scope.$index, scope.row)"></el-button>
          <el-button
            size="mini"
            type="danger"
            circle
            icon="el-icon-delete"
            v-permission="['permission_delete']"
            @click="handleDelete(scope.$index, scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogStatus" :visible.sync="permissionDialog" width="40%" :before-close="handleClose">
      <el-form ref="form" :model="form" :rules="rules" style="margin-left: 50px" label-width="80px">

        <el-form-item label="父级权限" prop="parentId">

          <el-select
            v-model="form.parentId"
            placeholder="请选择"
            @clear="handleClear"
            ref="selectUpResId">
            <el-option hidden :key="form.parentId" :value="form.parentId" :label="permissionName">
            </el-option>
            <el-tree
              ref="treeList"
              :data="permissionData.parent"
              :props="props"
              node-key="id"
              :default-expanded-keys="defaultExpandedKeys"
              :expand-on-click-node="false"
              :check-on-click-node="true"
              :highlight-current="true"
              :auto-expand-parent="true"
              current-node-key="1"
              @node-click="handleNodeClick">
            </el-tree>
          </el-select>

        </el-form-item>

        <el-form-item label="权限名称" prop="name">
          <el-input v-model="form.name" style="width: 200px" placeholder="如：system_index"></el-input>
        </el-form-item>

        <el-form-item label="显示名称" prop="display_name">
          <el-input v-model="form.display_name" style="width: 200px" placeholder="如：系统管理"></el-input>
        </el-form-item>

        <el-form-item label="类型" prop="">
          <el-radio-group v-model="form.type">
            <el-radio :label="2" border size="medium">菜单</el-radio>
            <el-radio :label="1" border size="medium" style="margin-left: -10px">按钮</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="form.sort" controls-position="right" @change="sortChange" :min="0" :max="10"></el-input-number>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelCreate">取 消</el-button>
        <el-button type="primary" @click="dialogStatus === '新增权限' ? confirmCreate() : confirmUpdate()">确 定</el-button>
      </span>
    </el-dialog>

  </div>

</template>

<script>

  import { permissionList, permissionTree, permissionCreate, permissionUpdate, permissionDestroy } from '@/api/permission'
  import permission from '@/directive/permission/index.js' // 权限判断指令
  import checkPermission from '@/utils/permission'
  import store from '@/store'
  import NProgress from 'nprogress'
  import router from '@/router' // 权限判断函数

  export default {
    name: 'adminTable',
    directives: { permission },
    data() {
      return {
        // 表格数据
        permissionList: [],
        listLoading: false,
        // 权限
        permissionDialog: false,
        dialogStatus: '',
        permissionData: {
          parent: null
        },
        // 默认展开节点
        defaultExpandedKeys: [],
        // 级联选择器属性设置
        props: {
          value: 'name',
          label: 'display_name',
          children: 'all_child',
          checkStrictly: true,
        },
        treeProps: {
          children: 'all_child',
          hasChildren: 'hasChildren'
        },
        test: {
          radio: 9
        },
        // 表单元素
        form: {
          parentId: '',
          name: '',
          display_name: '',
          sort: 0,
          type: 2,
          id: undefined
        },
        rules: {
          parentId: [
            { required: true, message: '请选择父级权限', trigger: 'blur' },
          ],
          name: [
            { required: true, message: '请输入权限名称', trigger: 'blur' }
          ],
          display_name: [
            { required: true, message: '请输入显示名称', trigger: 'blur' }
          ],
          type: [
            { required: true, message: '请选择类型', trigger: 'change' }
          ]
        },
        permissionName:''
      }
    },
    created() {
      this.getData()
      this.tree()
    },
    methods: {
      checkPermission,
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
        permissionList().then(response => {
          this.listLoading = false
          if (response.data.code == 200) {
            this.permissionList = response.data.data
            this.total = response.data.total
          } else {
            this.$message.error(response.data.message);
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
            this.$message.error(error.response.data.message)
          }
        })
      },
      // 重置表单元素
      resetTemp() {
        this.form = {
          parentId: '',
          name: '',
          display_name: '',
          sort: 0,
          type: 2
        }
      },
      // 新增权限
      permissionCreate() {
        this.resetTemp()
        this.handleClear()
        this.dialogStatus = '新增权限'
        this.permissionDialog = true
        this.$nextTick(() => {
          this.$refs['form'].clearValidate()
        })
      },
      handleEdit(key, index) {
        this.form = {
          parentId: index.parent_id,
          name: index.name,
          display_name: index.display_name,
          sort: index.sort,
          type: index.type,
          id: index.id
        }
        this.parentName(this.permissionData.parent, index.parent_id)
        this.dialogStatus = '编辑权限'
        this.permissionDialog = true
        this.defaultExpandedKeys = [index.parent_id]
        this.$nextTick(() => {
          this.$refs['form'].clearValidate()
          this.$refs.treeList.setCurrentKey(index.parent_id)
        })

      },
      // 删除权限
      handleDelete(key, index) {
        this.$confirm('是否永久删除该权限?', '请确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.listLoading = true
          permissionDestroy(index.id).then(response => {
            this.listLoading = false
            if (response.data.code == 200) {
              this.$message({
                message: response.data.message,
                type: 'success'
              });
              this.permissionDialog = false;
              this.getData()
              this.tree()
            } else {
              this.$message.error(response.data.message);
            }
          })
        }).catch(error => {
        })
      },
      handleClose(done) {
        this.permissionDialog = false;
        this.resetTemp()
      },
      // 排序
      sortChange(value) {
        this.form.sort = value
      },
      // 权限树
      tree() {
        this.listLoading = true
        permissionTree().then(response => {
          this.listLoading = false
          if (response.data.code == 200) {
            this.$set(this.permissionData, 'parent', this.getTreeData(response.data.data))
            this.defaultExpandedKeys = [0]
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
      // 获取父级权限名称
      parentName(data, parentId) {
        if (!data) {
          return
        }
        for (let i=0; i<data.length; i++) {

          if (data[i].id == parentId) {
            this.permissionName = data[i].display_name
            return false;
          }
          if (data[i].all_child && data[i].all_child !== undefined) {
            this.parentName(data[i].all_child, parentId)
          }
        }
      },
      handleNodeClick(data) {
        this.permissionName = data.display_name
        this.form.parentId = data.id
        this.$refs.selectUpResId.blur()
      },
      handleClear() {
        this.permissionName = ''
        this.form.parentId = ''
      },
      // 弹窗取消按钮
      cancelCreate() {
        this.permissionDialog = false;
      },
      confirmCreate() {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            // 添加权限
            this.listLoading = true
            permissionCreate(this.form).then(response => {
              this.listLoading = false
              if (response.data.code == 200) {
                this.$message({
                  message: response.data.message,
                  type: 'success'
                });
                this.permissionDialog = false;
                this.resetTemp()
                this.getData()
                this.tree()
              } else {
                this.$message.error(response.data.message);
              }
            })
          }
        })
      },
      confirmUpdate() {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            // 修改权限
            this.listLoading = true
            permissionUpdate(this.form).then(response => {
              this.listLoading = false;
              if (response.data.code == 200) {
                this.$message({
                  message: response.data.message,
                  type: 'success'
                });
                this.permissionDialog = false;
                this.resetTemp()
                this.getData()
                this.tree()
              } else {
                this.$message.error(response.data.message);
              }
            })
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>

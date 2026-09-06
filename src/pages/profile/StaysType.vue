<template>
  <div class="flex flex-col space-y-6 md:space-y-4">
    <div class="flex flex-col p-4 space-y-4 bg-backgroundSecondary rounded-lg">
      <h3 class="h3">{{ t('profile.stays_type.title') }}</h3>
      <p class="text-sm va-text-secondary">{{ t('profile.stays_type.intro') }}</p>
      <p class="text-sm va-text-secondary">{{ t('profile.stays_type.description') }}</p>

      <template v-if="isLoading">
        <va-skeleton v-for="n in 3" :key="n" height="3rem" class="mb-2" />
      </template>

      <template v-else>
        <!-- Built-in types: from stayed_at_options directly (translated, icon+desc included) -->
        <div class="flex flex-col space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wide va-text-secondary">
            {{ t('profile.stays_type.built_in') }}
          </label>
          <div class="flex flex-col rounded-lg border" style="border-color: var(--va-background-border)">
            <div
              v-for="item in builtInTypes"
              :key="item.value"
              class="flex items-center gap-3 p-3 border-b last:border-b-0"
              style="border-color: var(--va-background-border)"
            >
              <VaIcon v-if="item.icon" :name="item.icon" color="secondary" />
              <span v-else class="w-4" />
              <span class="flex-1 font-medium">
                {{ item.text }}
                <p class="text-sm va-text-secondary">{{ item.desc }}</p>
              </span>
              <va-chip size="small" color="secondary" outline icon="fa-lock">
                {{ t('profile.stays_type.built_in') }}
              </va-chip>
            </div>
          </div>
        </div>

        <!-- Custom types: this vessel's own rows, scoped by RLS, fully editable -->
        <div class="flex flex-col space-y-2">
          <label class="text-xs font-semibold uppercase tracking-wide va-text-secondary">
            {{ t('profile.stays_type.your_types') }}
          </label>

          <div
            v-if="!customTypes.length"
            class="p-3 text-sm va-text-secondary rounded-lg border"
            style="border-color: var(--va-background-border)"
          >
            {{ t('profile.stays_type.empty') }}
          </div>

          <div v-else class="flex flex-col rounded-lg border" style="border-color: var(--va-background-border)">
            <div
              v-for="item in customTypes"
              :key="item.value"
              class="flex items-start gap-3 p-3 border-b last:border-b-0"
              style="border-color: var(--va-background-border)"
            >
              <VaIcon :name="item.icon || 'sailing'" color="primary" class="mt-2" />

              <template v-if="editingCode === item.value">
                <div class="flex-1 flex flex-col gap-2">
                  <div class="flex gap-2 items-center">
                    <va-input
                      v-model="editingName"
                      outline
                      class="flex-1"
                      :maxlength="30"
                      autofocus
                      @keydown.enter="saveRename(item)"
                      @keydown.esc="cancelRename"
                    />
                    <va-button size="small" icon="check" preset="plain" :loading="isSaving" @click="saveRename(item)" />
                    <va-button size="small" icon="close" preset="plain" @click="cancelRename" />
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-xs va-text-secondary">{{ t('profile.stays_type.parent_type') }}</label>
                    <va-select
                      v-model="editingParentCode"
                      :options="parentOptions"
                      value-by="value"
                      text-by="text"
                      outline
                      class="max-w-xs"
                    />
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="flex-1 flex items-center gap-3">
                  <span class="font-medium">{{ item.text }}</span>
                  <va-chip v-if="parentLabel(item.parentCode)" size="small" color="secondary" outline>
                    {{ t('profile.stays_type.parent_type_badge', [parentLabel(item.parentCode)]) }}
                  </va-chip>
                </div>
                <va-button size="small" icon="edit" preset="plain" @click="startRename(item)" />
                <va-button size="small" icon="delete" preset="plain" color="danger" @click="confirmDeleteType(item)" />
              </template>
            </div>
          </div>

          <p v-if="formError" class="text-danger text-sm">{{ formError }}</p>

          <template v-if="isAdding">
            <div class="flex flex-col gap-2">
              <div class="flex gap-2 items-center">
                <va-input
                  v-model="newTypeName"
                  outline
                  class="flex-1"
                  :maxlength="30"
                  autofocus
                  :placeholder="t('profile.stays_type.add_placeholder')"
                  @keydown.enter="saveNewType"
                  @keydown.esc="cancelAdd"
                />
                <va-button icon="check" :loading="isSaving" @click="saveNewType">
                  {{ t('modals.save') }}
                </va-button>
                <va-button preset="plain" @click="cancelAdd">{{ t('modals.cancel') }}</va-button>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs va-text-secondary">{{ t('profile.stays_type.parent_type') }}</label>
                <va-select
                  v-model="newTypeParentCode"
                  :options="parentOptions"
                  value-by="value"
                  text-by="text"
                  outline
                  class="max-w-xs"
                />
                <p class="text-xs va-text-secondary">{{ t('profile.stays_type.parent_type_hint') }}</p>
              </div>
            </div>
          </template>
          <va-button v-else preset="outline" icon="add" @click="startAdd">
            {{ t('profile.stays_type.add_type') }}
          </va-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
  // TODO update setup with lang="ts"
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useModal, useToast } from 'vuestic-ui'
  import { useStayTypes, useCreateStayType, useRenameStayType, useDeleteStayType } from '../../queries/stay-types'
  import { getStayTypeOptions } from '../../utils/PostgSail'

  const { t } = useI18n()
  const { confirm } = useModal()
  const { init: initToast } = useToast()

  const { data: stayTypesData, isLoading } = useStayTypes()
  const allTypes = computed(() => stayTypesData.value ?? [])

  const rawCustomTypes = computed(() => allTypes.value.filter((row) => row.vessel_id != null))

  const stayTypeOptions = computed(() => getStayTypeOptions(rawCustomTypes.value))
  const builtInTypes = computed(() => stayTypeOptions.value.filter((opt) => !opt.isCustom))
  const customTypes = computed(() => stayTypeOptions.value.filter((opt) => opt.isCustom))

  // Fallback ("rolls up to") choices: built-ins only, plus an explicit
  // "no fallback" option — parent_code is optional (NULL is legitimate),
  // this just makes the choice visible instead of it always defaulting
  // silently to NULL when a type is created from this settings page.
  const parentOptions = computed(() => [
    { value: null, text: t('profile.stays_type.parent_type_none') },
    ...builtInTypes.value.map((opt) => ({ value: opt.value, text: opt.text })),
  ])
  function parentLabel(parentCode) {
    if (parentCode == null) return null
    return builtInTypes.value.find((opt) => opt.value === parentCode)?.text ?? null
  }

  const createType = useCreateStayType()
  const renameType = useRenameStayType()
  const deleteType = useDeleteStayType()
  const isSaving = computed(() => createType.isPending?.value || renameType.isPending?.value)

  const formError = ref('')

  /* Add */
  const isAdding = ref(false)
  const newTypeName = ref('')
  const newTypeParentCode = ref(null)
  function startAdd() {
    formError.value = ''
    newTypeName.value = ''
    newTypeParentCode.value = null
    isAdding.value = true
  }
  function cancelAdd() {
    isAdding.value = false
    newTypeName.value = ''
    newTypeParentCode.value = null
    formError.value = ''
  }
  async function saveNewType() {
    const description = newTypeName.value.trim()
    if (!description) {
      formError.value = t('profile.stays_type.name_required')
      return
    }
    formError.value = ''
    try {
      await createType.mutateAsync({ description, parentCode: newTypeParentCode.value })
      cancelAdd()
    } catch (err) {
      console.error('stay_type_create failed', err)
      formError.value = t('profile.stays_type.error')
    } finally {
      initToast({
        message: !formError.value ? t('profile.stays_type.added', [description]) : t('profile.stays_type.error'),
        position: 'top-right',
        color: !formError.value ? 'success' : 'warning',
      })
    }
  }

  /* Rename */
  const editingCode = ref(null)
  const editingName = ref('')
  const editingParentCode = ref(null)
  function startRename(item) {
    formError.value = ''
    editingCode.value = item.value
    editingName.value = item.text
    editingParentCode.value = item.parentCode ?? null
  }
  function cancelRename() {
    editingCode.value = null
    editingName.value = ''
    editingParentCode.value = null
  }
  async function saveRename(item) {
    const description = editingName.value.trim()
    if (!description) {
      formError.value = t('profile.stays_type.name_required')
      return
    }
    formError.value = ''
    try {
      await renameType.mutateAsync({
        stayCode: item.value,
        description,
        parentCode: editingParentCode.value,
      })
      cancelRename()
    } catch (err) {
      console.error('stay_type_rename failed', err)
      formError.value = t('profile.stays_type.error')
    } finally {
      initToast({
        message: !formError.value ? t('profile.stays_type.renamed', [description]) : t('profile.stays_type.error'),
        position: 'top-right',
        color: !formError.value ? 'success' : 'warning',
      })
    }
  }

  /* Delete — no usage_count column on this table, so the confirmation stays
     generic rather than naming a specific affected count. */
  async function confirmDeleteType(item) {
    const ok = await confirm({
      message: t('profile.stays_type.delete_confirm', [item.text]),
      title: t('profile.stays_type.delete_title'),
      okText: t('modals.delete'),
      cancelText: t('modals.cancel'),
    })
    if (!ok) return

    let deleteError = ''
    try {
      await deleteType.mutateAsync(item.value)
    } catch (err) {
      console.error('stay_type_delete failed', err)
      deleteError = t('profile.stays_type.error')
    } finally {
      initToast({
        message: !deleteError ? t('profile.stays_type.deleted', [item.text]) : deleteError,
        position: 'top-right',
        color: !deleteError ? 'success' : 'warning',
      })
    }
  }
</script>

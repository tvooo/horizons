import { observer } from 'mobx-react-lite'
import { SectionList, StyleSheet, Text, View } from 'react-native'
import type { ListModel } from 'shared'
import { useRootStore } from '../../src/stores/RootStoreContext'

const Lists = observer(() => {
  const store = useRootStore()

  const sections = [
    { title: 'Areas', data: store.areas },
    { title: 'Projects', data: store.projects },
    { title: 'Lists', data: store.regularLists },
  ].filter((section) => section.data.length > 0)

  if (sections.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No lists yet</Text>
      </View>
    )
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
      )}
      renderItem={({ item }: { item: ListModel }) => (
        <View style={styles.listItem}>
          <Text style={styles.listName}>{item.name}</Text>
          <Text style={styles.taskCount}>{item.numberOfOpenTasks}</Text>
        </View>
      )}
      style={styles.list}
    />
  )
})

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  list: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listName: {
    fontSize: 16,
  },
  taskCount: {
    fontSize: 14,
    color: '#999',
  },
})

export default Lists

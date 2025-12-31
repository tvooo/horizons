import { observer } from 'mobx-react-lite'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { useRootStore } from '../../src/stores/RootStoreContext'

const Inbox = observer(() => {
  const store = useRootStore()

  if (store.inboxTasks.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No tasks in inbox</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={store.inboxTasks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.taskItem}>
          <Text style={styles.taskTitle}>{item.title}</Text>
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
  taskItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  taskTitle: {
    fontSize: 16,
  },
})

export default Inbox

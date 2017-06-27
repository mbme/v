import { watchChanges, asyncWatchChanges } from './store'

describe('Store', () => {
  test('watchChanges() should detect changes', () => {
    const cb = jest.fn()

    const obj = watchChanges({ test: 1 }, cb)

    obj.test = 3
    obj.other = 5
    expect(cb).toHaveBeenCalledTimes(2)

    obj.obj = {}
    obj.obj.value = 'test'
    expect(cb).toHaveBeenCalledTimes(4)

    obj.arr = []
    obj.arr.push(1) // 2 operations here: arr[0] = 1 and arr.length = 1
    obj.arr[0] = 2
    expect(cb).toHaveBeenCalledTimes(8)

    obj.nestedObj = { test: { test: 1 } }
    obj.nestedObj.test.test = 2
    expect(cb).toHaveBeenCalledTimes(10)

    obj.nestedArr = [[[0]]]
    obj.nestedArr[0][0][0] = 7
    obj.nestedArr[0][0][1] = 7
    expect(cb).toHaveBeenCalledTimes(13)
  })

  test('asyncWatchChanges() should batch changes', (done) => {
    const cb = jest.fn()
    const obj = asyncWatchChanges({ test: 1, arr: [] }, cb)

    obj.test = 2
    obj.arr.push(1, 2, 3)
    obj.obj = {}
    expect(cb).toHaveBeenCalledTimes(0)

    setTimeout(() => {
      expect(cb).toHaveBeenCalledTimes(1)
      done()
    }, 1000)
  })
})

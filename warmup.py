import asyncio


async def g():
    print("B3")


async def f():
    print("B1")
    await g()
    print("B2")


async def main():
    print("A1")
    loop = asyncio.get_running_loop()

    loop.call_later(0, lambda: print("A2"))
    loop.call_soon(lambda: print("A4"))

    task_b = asyncio.create_task(f())
    print("A6")

    await asyncio.sleep(0)
    print("B4")
    await task_b


if __name__ == "__main__":
    asyncio.run(main())
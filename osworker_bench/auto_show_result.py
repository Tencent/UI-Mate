import os
import json
from datetime import datetime


def parse_result_file(result_path):
    """解析result.txt文件，返回浮点数结果"""
    try:
        with open(result_path, "r") as f:
            result = f.read().strip()
        try:
            return float(result)
        except:
            return float(eval(result))
    except:
        return 0.0


def collect_results_from_dir(target_dir):
    """从目标目录收集所有结果"""
    all_result = []
    domain_result = {}
    
    if not os.path.exists(target_dir):
        return all_result, domain_result
    
    for domain in os.listdir(target_dir):
        domain_path = os.path.join(target_dir, domain)
        if os.path.isdir(domain_path):
            for example_id in os.listdir(domain_path):
                example_path = os.path.join(domain_path, example_id)
                if os.path.isdir(example_path):
                    result_file = os.path.join(example_path, "result.txt")
                    if os.path.exists(result_file):
                        result_value = parse_result_file(result_file)
                        
                        if domain not in domain_result:
                            domain_result[domain] = []
                        domain_result[domain].append(result_value)
                        all_result.append(result_value)
    
    return all_result, domain_result


def _normalize_config(config):
    """将 args.json（扁平）或 config.json（嵌套 agent/run）统一为扁平字段，便于后续使用。"""
    if not isinstance(config, dict):
        return None
    # 新格式: config.json 含 environment / agent / run
    if "agent" in config or "run" in config:
        agent = config.get("agent") or {}
        run = config.get("run") or {}
        return {
            "model": agent.get("model") or agent.get("name") or "unknown",
            "max_steps": run.get("max_steps", "unknown"),
            "action_space": agent.get("action_space", "unknown"),
            "observation_type": agent.get("observation_type", "unknown"),
        }
    # 旧格式: args.json 扁平
    return {
        "model": config.get("model", "unknown"),
        "max_steps": config.get("max_steps", "unknown"),
        "action_space": config.get("action_space", "unknown"),
        "observation_type": config.get("observation_type", "unknown"),
    }


def _find_config_files(base_dir):
    """在 base_dir 下收集每个结果目录的配置文件路径。优先 config.json，其次 args.json。"""
    config_files = []
    for root, dirs, files in os.walk(base_dir):
        # 同一目录下优先使用 config.json
        if "config.json" in files:
            config_files.append(os.path.join(root, "config.json"))
        elif "args.json" in files:
            config_files.append(os.path.join(root, "args.json"))
    return config_files


def auto_scan_results(base_dir, limit=None):
    """自动扫描基础目录下的所有实验结果
    
    Args:
        base_dir: 基础目录路径
        limit: 如果指定，只显示最近n个模型的结果（按配置文件修改时间排序）
    
    支持的配置文件：config.json（新格式，含 agent/run）或 args.json（旧格式，扁平）。
    """
    if not os.path.exists(base_dir):
        print(f"目录不存在: {base_dir}")
        return
    
    # 查找所有 config.json 或 args.json 文件（每目录只取一个，优先 config.json）
    config_files = _find_config_files(base_dir)
    
    if not config_files:
        print(f"在 {base_dir} 中未找到任何 config.json 或 args.json 文件")
        return
    
    # 按实验分组处理
    experiments = []
    skipped_files = []
    
    for config_file in config_files:
        try:
            # 尝试读取和解析JSON文件
            try:
                with open(config_file, "r", encoding='utf-8') as f:
                    raw = f.read()
                if not raw.strip():
                    skipped_files.append((config_file, "配置文件为空（可能尚未写入完成）"))
                    continue
                config = json.loads(raw)
            except json.JSONDecodeError as e:
                skipped_files.append((config_file, f"JSON解析错误: {e}"))
                continue
            except IOError as e:
                skipped_files.append((config_file, f"文件读取错误: {e}"))
                continue
            
            # 验证是否为有效的实验配置文件
            if not isinstance(config, dict):
                skipped_files.append((config_file, "配置文件不是有效的字典格式"))
                continue
            
            # 扁平/嵌套都支持：检查是否包含实验相关字段
            flat = _normalize_config(config)
            if flat is None:
                skipped_files.append((config_file, "无法解析为实验配置"))
                continue
            has_experiment_fields = (
                flat["model"] != "unknown"
                or flat["action_space"] != "unknown"
                or flat["observation_type"] != "unknown"
                or flat["max_steps"] != "unknown"
            )
            if not has_experiment_fields:
                skipped_files.append((config_file, "不包含实验配置字段，跳过"))
                continue
            
            model_name = flat["model"]
            max_steps = flat["max_steps"]
            action_space = flat["action_space"]
            observation_type = flat["observation_type"]
            
            # 配置文件所在目录即结果目录
            result_dir = os.path.dirname(config_file)
            
            # 验证结果目录是否存在
            if not os.path.isdir(result_dir):
                skipped_files.append((config_file, f"结果目录不存在: {result_dir}"))
                continue
            
            # 收集结果
            all_result, domain_result = collect_results_from_dir(result_dir)
            
            # 配置文件修改时间，用于排序
            try:
                mtime = os.path.getmtime(config_file)
            except Exception:
                mtime = 0
            
            experiments.append({
                "config": config,
                "model": model_name,
                "max_steps": max_steps,
                "action_space": action_space,
                "observation_type": observation_type,
                "result_dir": result_dir,
                "all_result": all_result,
                "domain_result": domain_result,
                "mtime": mtime,
                "config_file": config_file
            })
        except Exception as e:
            skipped_files.append((config_file, f"未知错误: {type(e).__name__}: {e}"))
            continue
    
    # 如果有跳过的文件，打印警告信息
    if skipped_files:
        print(f"\n警告: 跳过了 {len(skipped_files)} 个无效的配置文件:")
        for file_path, reason in skipped_files:
            print(f"  - {file_path}")
            print(f"    原因: {reason}")
        print()
    
    # 按修改时间排序（最新的在前）
    experiments.sort(key=lambda x: x['mtime'], reverse=True)
    
    # 如果指定了limit，只显示最近n个
    if limit is not None and limit > 0:
        experiments = experiments[:limit]
        print(f"显示最近 {len(experiments)} 个模型的结果:\n")
    
    # 打印结果
    for exp in experiments:
        # 格式化时间戳为可读格式
        time_str = datetime.fromtimestamp(exp['mtime']).strftime('%Y-%m-%d %H:%M:%S')
        
        print("=" * 80)
        print(f"Model: {exp['model']}")
        print(f"Max Steps: {exp['max_steps']}")
        print(f"Action Space: {exp['action_space']}")
        print(f"Observation Type: {exp['observation_type']}")
        print(f"Config Time: {time_str}")
        print(f"Result Dir: {exp['result_dir']}")
        print("-" * 80)
        
        if not exp['all_result']:
            print("No results found.")
            print()
            continue
        
        # 按domain打印结果
        for domain in sorted(exp['domain_result'].keys()):
            domain_results = exp['domain_result'][domain]
            success_rate = sum(domain_results) / len(domain_results) * 100 if domain_results else 0
            print(f"Domain: {domain:25s} | Runned: {len(domain_results):3d} | "
                  f"Success Rate: {success_rate:6.2f}% | Sum: {sum(domain_results):.1f}")
        
        # 打印分类统计
        if exp['domain_result']:
            print("-" * 80)
            # Office
            office_domains = ["libreoffice_calc", "libreoffice_impress", "libreoffice_writer"]
            office_results = []
            for domain in office_domains:
                if domain in exp['domain_result']:
                    office_results.extend(exp['domain_result'][domain])
            if office_results:
                office_rate = sum(office_results) / len(office_results) * 100
                print(f"Office     | Runned: {len(office_results):3d} | Success Rate: {office_rate:6.2f}%")
            
            # Daily
            daily_domains = ["vlc", "thunderbird", "chrome"]
            daily_results = []
            for domain in daily_domains:
                if domain in exp['domain_result']:
                    daily_results.extend(exp['domain_result'][domain])
            if daily_results:
                daily_rate = sum(daily_results) / len(daily_results) * 100
                print(f"Daily      | Runned: {len(daily_results):3d} | Success Rate: {daily_rate:6.2f}%")
            
            # Professional
            pro_domains = ["gimp", "vs_code"]
            pro_results = []
            for domain in pro_domains:
                if domain in exp['domain_result']:
                    pro_results.extend(exp['domain_result'][domain])
            if pro_results:
                pro_rate = sum(pro_results) / len(pro_results) * 100
                print(f"Professional | Runned: {len(pro_results):3d} | Success Rate: {pro_rate:6.2f}%")
        
        # 打印总体统计
        print("-" * 80)
        total_rate = sum(exp['all_result']) / len(exp['all_result']) * 100 if exp['all_result'] else 0
        print(f"Total      | Runned: {len(exp['all_result']):3d} | Success Rate: {total_rate:6.2f}%")
        print()


if __name__ == '__main__':
    import sys
    import argparse
    
    parser = argparse.ArgumentParser(description='自动扫描并显示实验结果')
    parser.add_argument('base_dir', nargs='?',
                       default="./results",
                       help='基础目录路径（默认: ./results）')
    parser.add_argument('-n', '--limit', type=int, default=None,
                       help='只显示最近n个模型的结果（按 config.json/args.json 修改时间排序）')
    
    args = parser.parse_args()
    
    auto_scan_results(args.base_dir, limit=args.limit)
